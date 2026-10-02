import { updateInquiry } from "@/lib/server/inquiries";
import { fail, isResponse, ok, postBody, requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const body = await postBody(req);
  if (isResponse(body)) return body;

  const id = Number(body.id) || 0;
  if (!id) return fail("문의 번호가 없습니다.", 400);
  await updateInquiry(id, String(body.status ?? "new"), String(body.memo ?? ""));
  return ok();
}
