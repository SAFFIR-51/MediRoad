import { clearSession } from "@/lib/server/auth";
import { isResponse, ok, postBody } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await postBody(req);
  if (isResponse(body)) return body;
  await clearSession();
  return ok();
}
