import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** 회원 전용(매물)·관리자·로그인·API·업로드는 모든 크롤러에 막는다 */
const disallow = ["/location/", "/admin/", "/login/", "/signup/", "/forgot-password/", "/reset-password/", "/api/", "/install/", "/uploads/"];

/**
 * AI 답변엔진 크롤러를 명시적으로 허용한다 (AEO·GEO). 공개 페이지가 ChatGPT·Claude·퍼플렉시티·구글 AI 답변의 근거로 인용될 수 있게 한다.
 * 막으려면 해당 이름을 이 목록에서 빼고 disallow: "/" 규칙을 따로 추가한다.
 */
const aiBots = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: aiBots, allow: "/", disallow },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
