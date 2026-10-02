import { hasDb } from "@/lib/server/db";
import { createInquiry, validateInquiry } from "@/lib/server/inquiries";
import { clientIp, fail, isResponse, ok, postBody } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await postBody(req);
  if (isResponse(body)) return body;

  // 허니팟: 숨은 칸이 채워져 있으면 성공처럼 응답하고 저장하지 않는다
  if (String(body.website ?? "").trim()) return ok();

  const errors = validateInquiry(body);
  if (Object.keys(errors).length) return fail(Object.values(errors)[0], 422, errors);

  if (!hasDb()) {
    // DB 연결 전에는 저장할 곳이 없으므로 서버 로그에 남기고 안내한다
    console.log("[inquiry · DB 미연결]", JSON.stringify(body));
    return fail("상담 접수가 아직 준비 중입니다. 급한 문의는 전화로 연락해 주세요.", 503);
  }

  await createInquiry(body, clientIp(req));
  return ok();
}
