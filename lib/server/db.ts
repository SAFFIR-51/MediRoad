import "server-only";
import { Pool } from "pg";
import seedJson from "@/server/install/seed-listings.json";
import { hashPassword } from "@/lib/server/auth";

/**
 * Postgres 연결 (Vercel Postgres · Neon 등).
 * 환경변수가 없으면 DB 없이 동작하고, 매물은 데모 데이터로 공개 표시된다.
 * 첫 요청에서 테이블을 만들고(없을 때만) 데모 매물과 관리자 계정을 넣는다.
 */

export const dbUrl = () =>
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING || "";

export const hasDb = () => !!dbUrl();

let pool: Pool | null = null;
function getPool() {
  if (!pool) {
    const url = dbUrl();
    const local = /@(localhost|127\.0\.0\.1)/.test(url);
    pool = new Pool({ connectionString: url, max: 3, ssl: local ? undefined : { rejectUnauthorized: false } });
  }
  return pool;
}

const DDL = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at TIMESTAMPTZ)`,
  `CREATE TABLE IF NOT EXISTS listings (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    deal_type TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    region TEXT NOT NULL,
    address TEXT NOT NULL,
    deposit_manwon INTEGER,
    rent_manwon INTEGER,
    sale_price_manwon INTEGER,
    price_note TEXT NOT NULL DEFAULT '',
    area_m2 NUMERIC(10,2) NOT NULL,
    floor_current TEXT NOT NULL,
    floor_total INTEGER NOT NULL,
    use_type TEXT NOT NULL,
    approval_date DATE,
    direction TEXT NOT NULL,
    parking INTEGER NOT NULL DEFAULT 0,
    maintenance_manwon INTEGER NOT NULL DEFAULT 0,
    move_in TEXT NOT NULL,
    violation BOOLEAN NOT NULL DEFAULT false,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    description TEXT NOT NULL DEFAULT '',
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    status TEXT NOT NULL DEFAULT 'open',
    is_sample BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
    department TEXT NOT NULL DEFAULT '', region TEXT NOT NULL DEFAULT '', open_timing TEXT NOT NULL DEFAULT '',
    budget TEXT NOT NULL DEFAULT '', deposit TEXT NOT NULL DEFAULT '', rent TEXT NOT NULL DEFAULT '',
    facility_cost TEXT NOT NULL DEFAULT '', area TEXT NOT NULL DEFAULT '', facility TEXT NOT NULL DEFAULT '',
    consult_type TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new', memo TEXT NOT NULL DEFAULT '', ip TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS settings (skey TEXT PRIMARY KEY, svalue TEXT NOT NULL DEFAULT '')`,
  `CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL, used_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY, ip TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
];

type SeedListing = {
  code: string; dealType: string; category: string; title: string; region: string; address: string;
  depositManwon: number | null; rentManwon: number | null; salePriceManwon: number | null; priceNote?: string;
  areaM2: number; floorCurrent: string; floorTotal: number; useType: string; approvalDate: string | null;
  direction: string; parking: number; maintenanceManwon: number; moveIn: string; violation?: boolean;
  features?: string[]; description?: string; images?: string[]; lat?: number | null; lng?: number | null; date?: string;
};

/** tools/package.mjs 가 content/listings.json 에서 변환해 둔 데모 매물 8건 */
export const demoListings = ((seedJson as unknown as { items?: SeedListing[] }).items ?? (seedJson as unknown as SeedListing[])) as SeedListing[];

let ready: Promise<void> | null = null;

async function init() {
  const client = await getPool().connect();
  try {
    for (const sql of DDL) await client.query(sql);
    await client.query(
      `INSERT INTO settings (skey, svalue) VALUES ('location_menu_visible', '1') ON CONFLICT (skey) DO NOTHING`,
    );

    // 데모 매물: 비어 있을 때만 넣는다 (관리자에서 "예시 매물 전체 삭제" 로 지울 수 있음)
    const { rows } = await client.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM listings");
    if (rows[0]?.count === "0") {
      for (const [i, l] of demoListings.entries()) {
        await client.query(
          `INSERT INTO listings (code, deal_type, category, title, region, address, deposit_manwon, rent_manwon, sale_price_manwon,
             price_note, area_m2, floor_current, floor_total, use_type, approval_date, direction, parking, maintenance_manwon,
             move_in, violation, features, description, images, lat, lng, status, is_sample, sort_order, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21::jsonb,$22,$23::jsonb,$24,$25,'open',true,$26,$27)
           ON CONFLICT (code) DO NOTHING`,
          [
            l.code, l.dealType, l.category, l.title, l.region, l.address, l.depositManwon, l.rentManwon, l.salePriceManwon,
            l.priceNote ?? "", l.areaM2, l.floorCurrent, l.floorTotal, l.useType, l.approvalDate, l.direction, l.parking,
            l.maintenanceManwon, l.moveIn, !!l.violation, JSON.stringify(l.features ?? []), l.description ?? "",
            JSON.stringify(l.images ?? []), l.lat ?? null, l.lng ?? null, i, l.date ? `${l.date}T09:00:00+09:00` : new Date().toISOString(),
          ],
        );
      }
    }

    // 관리자 계정: ADMIN_EMAIL · ADMIN_PASSWORD 환경변수가 있으면 만들고, 이미 있으면 관리자 권한만 보장한다
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "";
    if (email && password) {
      await client.query(
        `INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,'admin')
         ON CONFLICT (email) DO UPDATE SET role = 'admin'`,
        [email, hashPassword(password), process.env.ADMIN_NAME || "관리자"],
      );
    }
  } finally {
    client.release();
  }
}

/** 첫 요청에서 한 번만 테이블·시드를 준비한다 */
export function ensureDb() {
  if (!ready) {
    ready = init().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}

export async function q<T extends Record<string, unknown> = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureDb();
  const r = await getPool().query(text, params as never[]);
  return r.rows as T[];
}

export async function one<T extends Record<string, unknown> = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}
