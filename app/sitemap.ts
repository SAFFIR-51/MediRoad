import type { MetadataRoute } from "next";
import { services, serviceHref } from "@/lib/site";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** 공개 페이지만 넣는다. 매물 정보(회원 전용)·로그인·관리자는 검색엔진에 노출하지 않는다. */
export default function sitemap(): MetadataRoute.Sitemap {
  const top = ["/", "/about/", "/about/greeting/", "/about/location/", "/analysis/", "/support/", "/partners/", "/faq/", "/contact/"];
  const fields = services.map(serviceHref);
  const docs = ["/terms/", "/privacy/"];
  // 빌드(배포) 시점을 수정일로 알려 검색엔진·AI 크롤러가 다시 읽을 시점을 판단하게 한다
  const lastModified = new Date();
  return [
    ...top.map((p) => ({ url: siteUrl + p, lastModified, changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.8 })),
    ...fields.map((p) => ({ url: siteUrl + p, lastModified, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...docs.map((p) => ({ url: siteUrl + p, lastModified, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
