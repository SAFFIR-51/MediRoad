import "server-only";
import { currentUser, type User } from "@/lib/server/auth";
import { hasDb } from "@/lib/server/db";

/** JSON API 공통 응답·검사 (규약은 docs/개편_사양.md 6장) */

export const ok = (data: Record<string, unknown> = {}) => Response.json({ ok: true, ...data });

export const fail = (message: string, status = 400, errors?: Record<string, string>) =>
  Response.json({ ok: false, error: message, ...(errors ? { errors } : {}) }, { status });

/** 상태를 바꾸는 요청에는 X-Requested-With 헤더가 필요하다 (CSRF 방지) */
export const csrfOk = (req: Request) => req.headers.get("x-requested-with") === "mediroad";

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const data = await req.json();
    return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export const clientIp = (req: Request) => (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";

export const DB_REQUIRED = "회원 기능을 쓰려면 데이터베이스 연결이 필요합니다. Vercel 프로젝트에 Postgres 를 연결한 뒤 다시 시도해 주세요.";

/** 로그인 회원 확인 (실패 시 Response 반환) */
export async function requireMember(): Promise<User | Response> {
  if (!hasDb()) return fail(DB_REQUIRED, 503);
  const user = await currentUser();
  return user ?? fail("로그인이 필요합니다.", 401);
}

export async function requireAdmin(): Promise<User | Response> {
  const user = await requireMember();
  if (user instanceof Response) return user;
  return user.role === "admin" ? user : fail("관리자만 접근할 수 있습니다.", 403);
}

export const isResponse = (v: unknown): v is Response => v instanceof Response;

/** POST 요청 공통 처리: CSRF 검사 + 본문 파싱 */
export async function postBody(req: Request): Promise<Record<string, unknown> | Response> {
  if (!csrfOk(req)) return fail("잘못된 요청입니다.", 403);
  return readJson(req);
}
