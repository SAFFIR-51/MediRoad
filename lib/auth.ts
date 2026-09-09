/**
 * 세션: 서명된 JWT 쿠키(mr_session). 회원 id 만 담고 매 요청 DB 에서 상태를 확인한다.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { getDb, schema, now } from "@/lib/db";
import type { Member } from "@/lib/db/schema";

const COOKIE = "mr_session";
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET || "mediroad-dev-secret-change-me");

export async function createSession(memberId: number) {
  const token = await new SignJWT({ mid: memberId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret());
  const store = await cookies();
  store.set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 3600 });
  const db = await getDb();
  await db.update(schema.members).set({ lastLogin: now() }).where(eq(schema.members.id, memberId));
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function sessionMemberId(): Promise<number | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.mid === "number" ? payload.mid : null;
  } catch {
    return null;
  }
}

export async function currentMember(): Promise<Member | null> {
  const id = await sessionMemberId();
  if (!id) return null;
  const db = await getDb();
  const m = await db.query.members.findFirst({ where: eq(schema.members.id, id) });
  return m && m.status === "active" ? m : null;
}

export async function requireMember(next?: string): Promise<Member> {
  const m = await currentMember();
  if (!m) redirect(`/member/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return m;
}

export async function requireAdmin(): Promise<Member> {
  const m = await currentMember();
  if (!m || m.role !== "admin") redirect("/member/login?next=%2Fadmin&reason=admin");
  return m;
}
