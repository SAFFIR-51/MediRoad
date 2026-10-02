import { stats } from "@/lib/server/listings";
import { isResponse, ok, requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  return ok(await stats());
}
