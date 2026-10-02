import { deleteSamples } from "@/lib/server/listings";
import { isResponse, ok, postBody, requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const body = await postBody(req);
  if (isResponse(body)) return body;

  return ok({ deleted: await deleteSamples() });
}
