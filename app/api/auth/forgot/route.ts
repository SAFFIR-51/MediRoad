import crypto from "node:crypto";
import { normalizeEmail, validEmail } from "@/lib/server/auth";
import { hasDb, one, q } from "@/lib/server/db";
import { sendResetMail } from "@/lib/server/inquiries";
import { DB_REQUIRED, fail, isResponse, ok, postBody } from "@/lib/server/http";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** 가입 여부와 관계없이 같은 응답을 준다. 토큰은 1시간 유효, DB 에는 해시만 저장. */
export async function POST(req: Request) {
  const body = await postBody(req);
  if (isResponse(body)) return body;
  if (!hasDb()) return fail(DB_REQUIRED, 503);

  const email = normalizeEmail(body.email);
  if (!validEmail(email)) return fail("올바른 이메일 주소를 입력해 주세요.", 422, { email: "올바른 이메일 주소를 입력해 주세요." });

  const user = await one<{ id: number; email: string; name: string }>("SELECT id, email, name FROM users WHERE email = $1", [email]);
  if (user) {
    const recent = await one<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM password_resets WHERE user_id = $1 AND created_at > now() - interval '10 minutes'",
      [user.id],
    );
    if (Number(recent?.count ?? 0) < 3) {
      const token = crypto.randomBytes(32).toString("hex");
      await q("INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1,$2, now() + interval '1 hour')", [
        user.id,
        crypto.createHash("sha256").update(token).digest("hex"),
      ]);
      const base = process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || ""}` || siteUrl;
      await sendResetMail(user.email, user.name, `${base.replace(/\/$/, "")}/reset-password/?token=${token}`);
    }
  }
  return ok();
}
