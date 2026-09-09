/** 매물 조회 (서버 전용) */
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { getDb, schema, getSetting } from "@/lib/db";
import { parseListing, type Listing } from "@/lib/listing-utils";

export * from "@/lib/listing-utils";

export async function allListings(opts: { includeHidden?: boolean } = {}): Promise<Listing[]> {
  const db = await getDb();
  const rows = await db.select().from(schema.listings)
    .where(opts.includeHidden ? undefined : ne(schema.listings.status, "hidden"))
    .orderBy(desc(schema.listings.sortOrder), desc(schema.listings.dateListed), desc(schema.listings.id));
  return rows.map(parseListing);
}

export async function recentListings(limit = 6): Promise<Listing[]> {
  const db = await getDb();
  const rows = await db.select().from(schema.listings).where(eq(schema.listings.status, "open"))
    .orderBy(desc(schema.listings.sortOrder), desc(schema.listings.dateListed), desc(schema.listings.id)).limit(limit);
  return rows.map(parseListing);
}

export async function findListing(code: string): Promise<Listing | null> {
  const db = await getDb();
  const row = await db.query.listings.findFirst({ where: eq(schema.listings.code, code) });
  return row ? parseListing(row) : null;
}

export async function relatedListings(l: Listing, limit = 3): Promise<Listing[]> {
  const db = await getDb();
  const rows = await db.select().from(schema.listings)
    .where(and(eq(schema.listings.type, l.type), ne(schema.listings.id, l.id), eq(schema.listings.status, "open")))
    .orderBy(desc(schema.listings.dateListed)).limit(limit);
  return rows.map(parseListing);
}

export async function bumpViews(id: number) {
  const db = await getDb();
  await db.update(schema.listings).set({ views: sql`${schema.listings.views} + 1` }).where(eq(schema.listings.id, id));
}

/** 매물 열람 정책: detail(상세만 회원) | all(목록도 회원) | none(전체 공개) */
export async function listingGate(): Promise<"detail" | "all" | "none"> {
  const v = await getSetting("listing_gate", "detail");
  return v === "all" || v === "none" ? v : "detail";
}
