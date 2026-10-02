import { listInquiries } from "@/lib/server/inquiries";
import { isResponse, ok, requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const status = new URL(req.url).searchParams.get("status") ?? "";
  return ok(await listInquiries(status || undefined));
}
