import { hashPassword, normalizeEmail, passwordProblem, setSession, validEmail } from "@/lib/server/auth";
import { hasDb, one } from "@/lib/server/db";
import { DB_REQUIRED, fail, isResponse, ok, postBody } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await postBody(req);
  if (isResponse(body)) return body;
  if (!hasDb()) return fail(DB_REQUIRED, 503);

  const email = normalizeEmail(body.email);
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const password = String(body.password ?? "");

  const errors: Record<string, string> = {};
  if (!validEmail(email)) errors.email = "올바른 이메일 주소를 입력해 주세요.";
  const pwProblem = passwordProblem(password);
  if (pwProblem) errors.password = pwProblem;
  if (!name) errors.name = "이름을 입력해 주세요.";
  if (!phone) errors.phone = "연락처를 입력해 주세요.";
  if (!body.agree) errors.agree = "이용약관과 개인정보처리방침에 동의해 주세요.";
  if (Object.keys(errors).length) return fail(Object.values(errors)[0], 422, errors);

  const exists = await one<{ id: number }>("SELECT id FROM users WHERE email = $1", [email]);
  if (exists) return fail("이미 가입된 이메일입니다. 로그인해 주세요.", 422, { email: "이미 가입된 이메일입니다." });

  const admin = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const user = await one<{ id: number; email: string; name: string; phone: string; role: "member" | "admin" }>(
    "INSERT INTO users (email, password_hash, name, phone, role) VALUES ($1,$2,$3,$4,$5) RETURNING id, email, name, phone, role",
    [email, hashPassword(password), name, phone, admin && admin === email ? "admin" : "member"],
  );
  if (!user) return fail("가입 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.", 500);

  await setSession(user.id);
  return ok({ user });
}
