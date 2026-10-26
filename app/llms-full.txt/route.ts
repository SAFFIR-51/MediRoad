import { llmsFullTxt } from "@/lib/llms";

export const dynamic = "force-static";

/** AI 답변엔진용 전체 본문 요약 (서비스 · 개원 타임라인 · FAQ) */
export function GET() {
  return new Response(llmsFullTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
