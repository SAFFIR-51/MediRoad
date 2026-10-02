import { getSettings } from "@/lib/server/settings";
import { ok } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return ok({ settings: await getSettings() });
}
