import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { hasDb, one, q } from "@/lib/server/db";

/**
 * 회원 인증 (Vercel 서버 모드).
 * 비밀번호는 scrypt 해시, 세션은 서명된 쿠키(mr_session)에 회원 id 만 담고 매 요청 DB 에서 역할을 확인한다.
 */

export const SESSION_COOKIE = "mr_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7일

export type User = { id: number; email: string; name: string; phone: string; role: "member" | "admin" };

function secret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "mediroad-dev-secret-change-me";
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = (stored || "").split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const calc = crypto.scryptSync(password, salt, 64);
  const want = Buffer.from(hash, "hex");
  return calc.length === want.length && crypto.timingSafeEqual(calc, want);
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createToken(userId: number) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readToken(token: string | undefined): number | null {
  if (!token || !token.includes(".")) return null;
  const [payload, mac] = token.split(".");
  const expected = sign(payload);
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { uid?: number; exp?: number };
    if (!data.uid || !data.exp || data.exp < Date.now()) return null;
    return data.uid;
  } catch {
    return null;
  }
}

export async function setSession(userId: number) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

/** 현재 로그인 회원 (DB 미연결이거나 세션이 없으면 null) */
export async function currentUser(): Promise<User | null> {
  if (!hasDb()) return null;
  const jar = await cookies();
  const uid = readToken(jar.get(SESSION_COOKIE)?.value);
  if (!uid) return null;
  try {
    return await one<User>("SELECT id, email, name, phone, role FROM users WHERE id = $1", [uid]);
  } catch {
    return null;
  }
}

/** 로그인 실패 제한: 같은 IP 에서 10분 안에 10회 실패하면 차단 */
export async function loginBlocked(ip: string) {
  const row = await one<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM login_attempts WHERE ip = $1 AND attempted_at > now() - interval '10 minutes'",
    [ip],
  );
  return Number(row?.count ?? 0) >= 10;
}

export async function loginFailed(ip: string, email: string) {
  await q("INSERT INTO login_attempts (ip, email) VALUES ($1, $2)", [ip, email.slice(0, 190)]);
  // 오래된 기록 정리 (개인정보처리방침: 최대 30일 보관)
  if (Math.random() < 0.05) {
    await q("DELETE FROM login_attempts WHERE attempted_at < now() - interval '1 day'");
    await q("DELETE FROM password_resets WHERE created_at < now() - interval '30 days'");
  }
}

export async function loginSucceeded(ip: string, userId: number) {
  await q("DELETE FROM login_attempts WHERE ip = $1", [ip]);
  await q("UPDATE users SET last_login_at = now() WHERE id = $1", [userId]);
}

export const normalizeEmail = (email: unknown) => String(email ?? "").trim().toLowerCase();
export const validEmail = (email: string) => !!email && email.length <= 190 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export function passwordProblem(password: unknown) {
  if (typeof password !== "string" || password.length < 8) return "비밀번호는 8자 이상으로 입력해 주세요.";
  if (password.length > 200) return "비밀번호가 너무 깁니다.";
  return null;
}
