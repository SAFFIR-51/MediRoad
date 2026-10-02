import { setStatus } from "@/lib/server/listings";
import type { ListingStatus } from "@/lib/listing-utils";
import { fail, isResponse, ok, postBody, requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const body = await postBody(req);
  if (isResponse(body)) return body;

  const id = Number(body.id) || 0;
  const status = String(body.status ?? "");
  if (!id || !["open", "closed", "hidden"].includes(status)) return fail("상태 값이 올바르지 않습니다.", 400);

  await setStatus(id, status as ListingStatus);
  return ok();
}
