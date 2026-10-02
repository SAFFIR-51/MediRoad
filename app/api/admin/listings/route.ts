import { adminListings } from "@/lib/server/listings";
import { isResponse, ok, requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const p = new URL(req.url).searchParams;
  return ok({ items: await adminListings({ status: p.get("status") ?? "", dealType: p.get("dealType") ?? "", q: p.get("q") ?? "" }) });
}
