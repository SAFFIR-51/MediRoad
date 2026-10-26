import { llmsTxt } from "@/lib/llms";

export const dynamic = "force-static";

/** AI 답변엔진용 사이트 안내 (https://llmstxt.org) */
export function GET() {
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
