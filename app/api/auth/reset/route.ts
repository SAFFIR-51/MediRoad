import crypto from "node:crypto";
import { hashPassword, passwordProblem } from "@/lib/server/auth";
import { hasDb, one, q } from "@/lib/server/db";
import { DB_REQUIRED, fail, isResponse, ok, postBody } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await postBody(req);
  if (isResponse(body)) return body;
  if (!hasDb()) return fail(DB_REQUIRED, 503);

  const token = String(body.token ?? "");
  const password = String(body.password ?? "");
  const problem = passwordProblem(password);
  if (problem) return fail(problem, 422, { password: problem });
  if (!token) return fail("재설정 링크가 올바르지 않습니다.", 400);

  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const row = await one<{ id: number; user_id: number }>(
    "SELECT id, user_id FROM password_resets WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()",
    [hash],
  );
  if (!row) return fail("재설정 링크가 만료되었거나 이미 사용되었습니다. 비밀번호 찾기를 다시 진행해 주세요.", 400);

  await q("UPDATE users SET password_hash = $2 WHERE id = $1", [row.user_id, hashPassword(password)]);
  await q("UPDATE password_resets SET used_at = now() WHERE user_id = $1 AND used_at IS NULL", [row.user_id]);
  return ok();
}
