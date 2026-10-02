import { currentUser } from "@/lib/server/auth";
import { ok } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return ok({ user: await currentUser() });
}
