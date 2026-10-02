import { currentUser } from "@/lib/server/auth";
import { hasDb } from "@/lib/server/db";
import { isDemoMode, publicListings } from "@/lib/server/listings";
import { getSettings } from "@/lib/server/settings";
import { fail, ok } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** 매물 목록. DB 연결 전(데모 상태)에는 누구나 볼 수 있고, 연결되면 회원 전용이다. */
export async function GET() {
  if (isDemoMode()) return ok({ items: await publicListings(), demo: true });

  const settings = await getSettings();
  if (!settings.locationMenuVisible) {
    const user = await currentUser();
    if (user?.role !== "admin") return fail("매물 정보는 현재 공개되지 않습니다.", 403);
  } else if (hasDb()) {
    const user = await currentUser();
    if (!user) return fail("로그인이 필요합니다.", 401);
  }

  return ok({ items: await publicListings() });
}
