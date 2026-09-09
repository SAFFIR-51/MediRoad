import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

/** 로그아웃 (GET 링크) */
export async function GET(req: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/", req.url));
}
