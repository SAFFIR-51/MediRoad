import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 접근 제어 (Next 16 proxy = 옛 middleware).
 *  - 매물 정보(/location): 로그인 회원만. 단, 데이터베이스가 연결되지 않은 데모 상태에서는 공개한다.
 *  - 관리자(/admin): 로그인 필요 (관리자 권한은 화면·API 에서 한 번 더 확인).
 *  - 로그인·회원가입 화면: 이미 로그인했으면 돌려보낸다.
 */

const SESSION = "mr_session";
const safeNext = (value: string | null) => (value && value.startsWith("/") && !value.startsWith("//") ? value : "/");

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const loggedIn = !!req.cookies.get(SESSION)?.value;
  const dbReady = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL);

  if (pathname.startsWith("/admin") && !loggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/login/";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/location") && dbReady && !loggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/login/";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/login/" || pathname === "/signup" || pathname === "/signup/") && loggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = safeNext(req.nextUrl.searchParams.get("next"));
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/location/:path*", "/admin/:path*", "/login", "/login/", "/signup", "/signup/"],
};
