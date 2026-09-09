/**
 * DB 연결 (libsql / SQLite)
 *  - 로컬·일반 Node 호스팅: DATABASE_URL=file:./data/mediroad.db (기본값)
 *  - Vercel 등 서버리스: DATABASE_URL=libsql://... + DATABASE_AUTH_TOKEN (Turso)
 * 첫 접속 시 테이블을 만들고 관리자 계정과 예시 매물을 넣는다.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { count, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as schema from "./schema";
import { seedListings } from "@/lib/site";

const DDL = [
  `CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
    name TEXT NOT NULL, phone TEXT, email TEXT, role TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'active', memo TEXT, must_change_pw INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL, last_login TEXT)`,
  `CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, type TEXT NOT NULL, category TEXT NOT NULL,
    title TEXT NOT NULL, region TEXT NOT NULL, address TEXT, date_listed TEXT NOT NULL,
    deposit TEXT, rent TEXT, area TEXT, floor TEXT, features TEXT, images TEXT,
    description TEXT, lat REAL, lng REAL, is_sample INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'open',
    views INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, board TEXT NOT NULL DEFAULT 'archive', title TEXT NOT NULL, content TEXT,
    file_path TEXT, file_name TEXT, is_notice INTEGER NOT NULL DEFAULT 0, views INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, email TEXT, fields TEXT, message TEXT,
    listing_code TEXT, status TEXT NOT NULL DEFAULT 'new', memo TEXT, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS password_resets (token TEXT PRIMARY KEY, member_id INTEGER NOT NULL, expires_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS popups (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT, image TEXT, link TEXT,
    start_at TEXT, end_at TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS settings (skey TEXT PRIMARY KEY, svalue TEXT)`,
];

export function now() {
  // KST 기준 'YYYY-MM-DD HH:mm:ss'
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  return d.toISOString().slice(0, 19).replace("T", " ");
}
export function today() {
  return now().slice(0, 10);
}

type DB = ReturnType<typeof drizzle<typeof schema>>;
const g = globalThis as unknown as { __mrClient?: Client; __mrDb?: DB; __mrReady?: Promise<void> };

function client(): Client {
  if (g.__mrClient) return g.__mrClient;
  let url = process.env.DATABASE_URL || "file:./data/mediroad.db";
  if (url.startsWith("file:")) {
    const p = url.slice(5);
    // 기본값(./data/…)이면 프로젝트의 data 폴더를 만들고, 절대 경로면 그대로 사용
    const dataDir = path.join(process.cwd(), "data");
    if (!path.isAbsolute(p)) fs.mkdirSync(dataDir, { recursive: true });
    const abs = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
    url = "file:" + abs;
  }
  g.__mrClient = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  return g.__mrClient;
}

async function migrate(db: DB) {
  const c = client();
  for (const sql of DDL) await c.execute(sql);
  // 관리자 초기 계정
  const [{ n: admins }] = await db.select({ n: count() }).from(schema.members).where(eq(schema.members.role, "admin"));
  if (admins === 0) {
    const id = process.env.ADMIN_ID || "admin";
    const pw = process.env.ADMIN_PASSWORD || "mediroad1234!";
    await db.insert(schema.members).values({ userId: id, passwordHash: await bcrypt.hash(pw, 10), name: "관리자", role: "admin", status: "active", mustChangePw: 1, createdAt: now() });
  }
  // 예시 매물 시드
  const [{ n: nListings }] = await db.select({ n: count() }).from(schema.listings);
  if (nListings === 0) {
    for (const it of seedListings) {
      await db.insert(schema.listings).values({
        code: it.id, type: it.type, category: it.category, title: it.title, region: it.region, address: it.address ?? "",
        dateListed: it.date, deposit: it.deposit ?? "", rent: it.rent ?? "", area: it.area ?? "", floor: it.floor ?? "",
        features: JSON.stringify(it.features ?? []), images: JSON.stringify(it.images ?? []), description: it.description ?? "",
        lat: it.lat ?? null, lng: it.lng ?? null, isSample: it.sample ? 1 : 0, status: "open", createdAt: now(), updatedAt: now(),
      });
    }
  }
}

/** drizzle 인스턴스 (첫 호출 시 마이그레이션·시드 실행) */
export async function getDb(): Promise<DB> {
  if (!g.__mrDb) g.__mrDb = drizzle(client(), { schema });
  if (!g.__mrReady) g.__mrReady = migrate(g.__mrDb).catch((e) => { g.__mrReady = undefined; throw e; });
  await g.__mrReady;
  return g.__mrDb;
}

export async function getSetting(key: string, def = ""): Promise<string> {
  const db = await getDb();
  const row = await db.query.settings.findFirst({ where: eq(schema.settings.key, key) });
  return row?.value ?? def;
}
export async function setSetting(key: string, value: string) {
  const db = await getDb();
  await db.insert(schema.settings).values({ key, value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } });
}

export { schema };
