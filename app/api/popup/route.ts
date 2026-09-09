import { and, eq, or, isNull, lte, gte, desc } from "drizzle-orm";
import { getDb, schema, today } from "@/lib/db";

/** 게시 중인 오픈 팝업 목록 */
export async function GET() {
  const db = await getDb();
  const t = today();
  const rows = await db.select().from(schema.popups)
    .where(and(eq(schema.popups.isActive, 1), or(isNull(schema.popups.startAt), lte(schema.popups.startAt, t)), or(isNull(schema.popups.endAt), gte(schema.popups.endAt, t))))
    .orderBy(desc(schema.popups.id));
  return Response.json({ items: rows.map((p) => ({ id: p.id, title: p.title, content: p.content, image: p.image, link: p.link })) }, { headers: { "Cache-Control": "no-store" } });
}
