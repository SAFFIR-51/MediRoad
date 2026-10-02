import { loginBlocked, loginFailed, loginSucceeded, normalizeEmail, setSession, verifyPassword } from "@/lib/server/auth";
import { hasDb, one } from "@/lib/server/db";
import { clientIp, DB_REQUIRED, fail, isResponse, ok, postBody } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await postBody(req);
  if (isResponse(body)) return body;
  if (!hasDb()) return fail(DB_REQUIRED, 503);

  const email = normalizeEmail(body.email);
  const password = String(body.password ?? "");
  const ip = clientIp(req);

  if (await loginBlocked(ip)) return fail("로그인 시도가 너무 많습니다. 10분 뒤에 다시 시도해 주세요.", 429);

  const user = await one<{ id: number; email: string; name: string; phone: string; role: "member" | "admin"; password_hash: string }>(
    "SELECT id, email, name, phone, role, password_hash FROM users WHERE email = $1",
    [email],
  );
  if (!user || !verifyPassword(password, user.password_hash)) {
    await loginFailed(ip, email);
    return fail("이메일 또는 비밀번호가 올바르지 않습니다.", 401);
  }

  await setSession(user.id);
  await loginSucceeded(ip, user.id);
  return ok({ user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role } });
}
