import "server-only";
import { demoListings, hasDb, one, q } from "@/lib/server/db";
import type { DealType, Listing, ListingStatus } from "@/lib/listing-utils";

/**
 * 매물 데이터.
 * DB 가 연결되면 Postgres 를 쓰고, 연결 전에는 데모 매물(content/listings.json 변환본)을 읽기 전용으로 보여준다.
 * 가격은 만원 단위 정수만 받아 "협의"만 적을 수 없게 한다 (공인중개사법 인터넷 표시·광고 명시사항).
 */

type Row = Record<string, unknown>;

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
};

const toListing = (r: Row): Listing => ({
  id: Number(r.id),
  code: String(r.code),
  dealType: String(r.deal_type) as DealType,
  category: String(r.category),
  title: String(r.title),
  region: String(r.region),
  address: String(r.address ?? ""),
  depositManwon: num(r.deposit_manwon),
  rentManwon: num(r.rent_manwon),
  salePriceManwon: num(r.sale_price_manwon),
  priceNote: String(r.price_note ?? ""),
  areaM2: Number(r.area_m2 ?? 0),
  floorCurrent: String(r.floor_current ?? ""),
  floorTotal: Number(r.floor_total ?? 0),
  useType: String(r.use_type ?? ""),
  approvalDate: r.approval_date ? new Date(r.approval_date as string).toISOString().slice(0, 10) : "",
  direction: String(r.direction ?? ""),
  parking: Number(r.parking ?? 0),
  maintenanceManwon: Number(r.maintenance_manwon ?? 0),
  moveIn: String(r.move_in ?? ""),
  violation: !!r.violation,
  features: Array.isArray(r.features) ? (r.features as string[]) : [],
  description: String(r.description ?? ""),
  images: Array.isArray(r.images) ? (r.images as string[]) : [],
  lat: num(r.lat),
  lng: num(r.lng),
  status: String(r.status ?? "open") as ListingStatus,
  isSample: !!r.is_sample,
  closedAt: r.closed_at ? new Date(r.closed_at as string).toISOString() : null,
  createdAt: r.created_at ? new Date(r.created_at as string).toISOString() : "",
  updatedAt: r.updated_at ? new Date(r.updated_at as string).toISOString() : "",
});

/** DB 가 없을 때 보여주는 데모 매물 */
function demo(): Listing[] {
  return demoListings.map((l, i) => ({
    id: i + 1,
    code: l.code,
    dealType: l.dealType as DealType,
    category: l.category,
    title: l.title,
    region: l.region,
    address: l.address,
    depositManwon: l.depositManwon,
    rentManwon: l.rentManwon,
    salePriceManwon: l.salePriceManwon,
    priceNote: l.priceNote ?? "",
    areaM2: l.areaM2,
    floorCurrent: l.floorCurrent,
    floorTotal: l.floorTotal,
    useType: l.useType,
    approvalDate: l.approvalDate ?? "",
    direction: l.direction,
    parking: l.parking,
    maintenanceManwon: l.maintenanceManwon,
    moveIn: l.moveIn,
    violation: !!l.violation,
    features: l.features ?? [],
    description: l.description ?? "",
    images: l.images ?? [],
    lat: l.lat ?? null,
    lng: l.lng ?? null,
    status: "open",
    isSample: true,
    closedAt: null,
    createdAt: l.date ? `${l.date}T00:00:00.000Z` : new Date().toISOString(),
    updatedAt: l.date ? `${l.date}T00:00:00.000Z` : new Date().toISOString(),
  }));
}

export const isDemoMode = () => !hasDb();

/** 회원에게 보여줄 매물 (노출 중인 것만) */
export async function publicListings(): Promise<Listing[]> {
  if (!hasDb()) return demo();
  const rows = await q<Row>("SELECT * FROM listings WHERE status = 'open' ORDER BY created_at DESC, id DESC");
  return rows.map(toListing);
}

export async function publicListing(code: string): Promise<{ item: Listing; related: Listing[] } | null> {
  const all = await publicListings();
  const item = all.find((l) => l.code === code);
  if (!item) return null;
  const sameTab = (a: Listing, b: Listing) => (a.dealType === "매매") === (b.dealType === "매매");
  return { item, related: all.filter((l) => l.code !== code && sameTab(l, item)).slice(0, 3) };
}

export async function adminListings(filter: { status?: string; dealType?: string; q?: string }): Promise<Listing[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.status) {
    params.push(filter.status);
    where.push(`status = $${params.length}`);
  }
  if (filter.dealType) {
    params.push(filter.dealType);
    where.push(`deal_type = $${params.length}`);
  }
  if (filter.q) {
    params.push(`%${filter.q}%`);
    where.push(`(code ILIKE $${params.length} OR title ILIKE $${params.length} OR region ILIKE $${params.length} OR address ILIKE $${params.length})`);
  }
  const rows = await q<Row>(
    `SELECT * FROM listings ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY created_at DESC, id DESC`,
    params,
  );
  return rows.map(toListing);
}

export async function adminListing(id: number): Promise<Listing | null> {
  const row = await one<Row>("SELECT * FROM listings WHERE id = $1", [id]);
  return row ? toListing(row) : null;
}

/* ---------------- 저장 · 검증 ---------------- */

const REQUIRED: [string, string][] = [
  ["title", "매물 제목을 입력해 주세요."],
  ["region", "지역을 입력해 주세요. (예: 서울 강서구)"],
  ["address", "소재지를 입력해 주세요."],
  ["category", "업종을 입력해 주세요."],
  ["useType", "건축물 용도를 입력해 주세요."],
  ["direction", "방향을 입력해 주세요."],
  ["moveIn", "입주가능일을 입력해 주세요."],
  ["floorCurrent", "해당층을 입력해 주세요."],
];

const IMAGE_OK = /^\/(uploads|images)\/|^https:\/\/[a-z0-9.-]*\.public\.blob\.vercel-storage\.com\//i;

export type SaveInput = Record<string, unknown>;

export function validate(input: SaveInput) {
  const errors: Record<string, string> = {};
  const str = (k: string) => String(input[k] ?? "").trim();

  for (const [field, message] of REQUIRED) if (!str(field)) errors[field] = message;

  const dealType = str("dealType");
  if (!["임대", "분양", "매매"].includes(dealType)) errors.dealType = "거래형태를 선택해 주세요.";

  const area = num(input.areaM2);
  if (!area || area <= 0) errors.areaM2 = "전용면적을 ㎡ 숫자로 입력해 주세요.";
  const floorTotal = num(input.floorTotal);
  if (!floorTotal || floorTotal <= 0) errors.floorTotal = "총층을 숫자로 입력해 주세요.";
  if (!str("approvalDate")) errors.approvalDate = "사용승인일을 입력해 주세요.";
  const parking = num(input.parking);
  if (parking === null || parking < 0) errors.parking = "주차대수를 숫자로 입력해 주세요. (주차 불가는 0)";
  const maintenance = num(input.maintenanceManwon);
  if (maintenance === null || maintenance < 0) errors.maintenanceManwon = "관리비를 만원 단위 숫자로 입력해 주세요. (없으면 0)";

  const deposit = num(input.depositManwon);
  const rent = num(input.rentManwon);
  const sale = num(input.salePriceManwon);
  if (dealType === "임대") {
    if (!deposit) errors.depositManwon = "임대 매물은 보증금을 만원 단위 숫자로 입력해 주세요. '협의'만 적을 수는 없습니다.";
    if (!rent) errors.rentManwon = "임대 매물은 월세를 만원 단위 숫자로 입력해 주세요. '협의'만 적을 수는 없습니다.";
  } else if (!sale) {
    errors.salePriceManwon = `${dealType} 매물은 ${dealType === "분양" ? "분양가" : "매매가"}를 만원 단위 숫자로 입력해 주세요. '협의'만 적을 수는 없습니다.`;
  }

  const images = Array.isArray(input.images) ? (input.images as unknown[]).map(String) : [];
  if (images.some((src) => !IMAGE_OK.test(src))) errors.images = "사진은 이 사이트에 올린 파일만 쓸 수 있습니다.";

  return { errors, dealType, area, floorTotal, parking, maintenance, deposit, rent, sale, images };
}

async function nextCode(dealType: string) {
  const prefix = dealType === "매매" ? "S" : "L";
  const year = new Date().getFullYear();
  const row = await one<{ code: string }>(
    "SELECT code FROM listings WHERE code LIKE $1 ORDER BY code DESC LIMIT 1",
    [`${prefix}-${year}-%`],
  );
  const last = row ? Number(row.code.split("-")[2]) : 0;
  return `${prefix}-${year}-${String(last + 1).padStart(3, "0")}`;
}

export async function saveListing(input: SaveInput): Promise<{ id: number; code: string } | { errors: Record<string, string> }> {
  const v = validate(input);
  if (Object.keys(v.errors).length) return { errors: v.errors };

  const id = Number(input.id) || 0;
  const str = (k: string) => String(input[k] ?? "").trim();
  const features = Array.isArray(input.features)
    ? (input.features as unknown[]).map((f) => String(f).trim()).filter(Boolean)
    : String(input.features ?? "").split(",").map((f) => f.trim()).filter(Boolean);
  const status = ["open", "closed", "hidden"].includes(str("status")) ? str("status") : "open";

  const values = [
    v.dealType, str("category"), str("title"), str("region"), str("address"),
    v.dealType === "임대" ? v.deposit : num(input.depositManwon),
    v.dealType === "임대" ? v.rent : num(input.rentManwon),
    v.dealType === "임대" ? null : v.sale,
    str("priceNote"), v.area, str("floorCurrent"), v.floorTotal, str("useType"), str("approvalDate"),
    str("direction"), v.parking, v.maintenance, str("moveIn"), !!input.violation,
    JSON.stringify(features), str("description"), JSON.stringify(v.images), num(input.lat), num(input.lng), status,
  ];

  if (id) {
    const row = await one<{ id: number; code: string }>(
      `UPDATE listings SET deal_type=$1, category=$2, title=$3, region=$4, address=$5, deposit_manwon=$6, rent_manwon=$7,
         sale_price_manwon=$8, price_note=$9, area_m2=$10, floor_current=$11, floor_total=$12, use_type=$13, approval_date=$14,
         direction=$15, parking=$16, maintenance_manwon=$17, move_in=$18, violation=$19, features=$20::jsonb, description=$21,
         images=$22::jsonb, lat=$23, lng=$24, status=$25,
         closed_at = CASE WHEN $25 = 'closed' THEN COALESCE(closed_at, now()) ELSE NULL END,
         updated_at = now()
       WHERE id=$26 RETURNING id, code`,
      [...values, id],
    );
    if (!row) return { errors: { title: "매물을 찾을 수 없습니다." } };
    return { id: row.id, code: row.code };
  }

  const code = await nextCode(v.dealType);
  const row = await one<{ id: number; code: string }>(
    `INSERT INTO listings (deal_type, category, title, region, address, deposit_manwon, rent_manwon, sale_price_manwon,
       price_note, area_m2, floor_current, floor_total, use_type, approval_date, direction, parking, maintenance_manwon,
       move_in, violation, features, description, images, lat, lng, status, code, closed_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20::jsonb,$21,$22::jsonb,$23,$24,$25,$26,
       CASE WHEN $25 = 'closed' THEN now() ELSE NULL END)
     RETURNING id, code`,
    [...values, code],
  );
  return { id: row!.id, code: row!.code };
}

export async function setStatus(id: number, status: ListingStatus) {
  await q(
    `UPDATE listings SET status = $2, closed_at = CASE WHEN $2 = 'closed' THEN COALESCE(closed_at, now()) ELSE NULL END, updated_at = now()
     WHERE id = $1`,
    [id, status],
  );
}

export async function deleteListing(id: number) {
  await q("DELETE FROM listings WHERE id = $1", [id]);
}

export async function deleteSamples(): Promise<number> {
  const rows = await q<{ id: number }>("DELETE FROM listings WHERE is_sample = true RETURNING id");
  return rows.length;
}

export async function stats() {
  const row = await one<Record<string, string>>(
    `SELECT
       (SELECT COUNT(*) FROM inquiries WHERE status = 'new')::text AS inquiries_new,
       (SELECT COUNT(*) FROM listings WHERE status = 'open')::text AS listings_open,
       (SELECT COUNT(*) FROM listings WHERE status = 'closed')::text AS listings_closed,
       (SELECT COUNT(*) FROM listings WHERE status = 'hidden')::text AS listings_hidden,
       (SELECT COUNT(*) FROM listings WHERE is_sample = true)::text AS listings_sample,
       (SELECT COUNT(*) FROM users)::text AS members`,
  );
  return {
    inquiriesNew: Number(row?.inquiries_new ?? 0),
    listingsOpen: Number(row?.listings_open ?? 0),
    listingsClosed: Number(row?.listings_closed ?? 0),
    listingsHidden: Number(row?.listings_hidden ?? 0),
    listingsSample: Number(row?.listings_sample ?? 0),
    members: Number(row?.members ?? 0),
  };
}
