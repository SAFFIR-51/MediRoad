import { getInquiry } from "@/lib/server/inquiries";
import { fail, isResponse, ok, requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const id = Number(new URL(req.url).searchParams.get("id")) || 0;
  const item = id ? await getInquiry(id) : null;
  return item ? ok({ item }) : fail("문의를 찾을 수 없습니다.", 404);
}
