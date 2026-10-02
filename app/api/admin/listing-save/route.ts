import { saveListing } from "@/lib/server/listings";
import { fail, isResponse, ok, postBody, requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const body = await postBody(req);
  if (isResponse(body)) return body;

  const result = await saveListing(body);
  if ("errors" in result) return fail(Object.values(result.errors)[0], 422, result.errors);
  return ok(result);
}
