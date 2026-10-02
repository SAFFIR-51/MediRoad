import { currentUser } from "@/lib/server/auth";
import { isDemoMode, publicListing } from "@/lib/server/listings";
import { getSettings } from "@/lib/server/settings";
import { fail, ok } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code") ?? "";
  if (!code) return fail("매물번호가 없습니다.", 400);

  // 매물 상세는 데모 상태에서도 회원만 볼 수 있다
  const user = await currentUser();
  if (!user) return fail("로그인이 필요합니다.", 401);
  if (!isDemoMode()) {
    const settings = await getSettings();
    if (!settings.locationMenuVisible && user.role !== "admin") return fail("매물 정보는 현재 공개되지 않습니다.", 403);
  }

  const found = await publicListing(code);
  if (!found) return fail("거래가 끝났거나 게시가 중단된 매물입니다.", 404);
  return ok(found);
}
