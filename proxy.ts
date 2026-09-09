import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/** 회원/관리자 전용 경로 1차 차단 (세션 쿠키 유무·서명만 확인, 권한은 페이지에서 재확인) */
export async function proxy(req: NextRequest) {
  const token = req.cookies.get("mr_session")?.value;
  let ok = false;
  if (token) {
    try { await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET || "mediroad-dev-secret-change-me")); ok = true; } catch { ok = false; }
  }
  if (!ok) {
    const url = new URL("/member/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    if (req.nextUrl.pathname.startsWith("/admin")) url.searchParams.set("reason", "admin");
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/member/mypage"] };
