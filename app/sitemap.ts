import type { MetadataRoute } from "next";
import { services, serviceHref } from "@/lib/site";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** 공개 페이지만 넣는다. 매물 정보(회원 전용)·로그인·관리자는 검색엔진에 노출하지 않는다. */
export default function sitemap(): MetadataRoute.Sitemap {
  const top = ["/", "/about/", "/about/greeting/", "/about/location/", "/analysis/", "/support/", "/contact/"];
  const fields = services.map(serviceHref);
  const docs = ["/terms/", "/privacy/"];
  return [
    ...top.map((p) => ({ url: siteUrl + p, changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.8 })),
    ...fields.map((p) => ({ url: siteUrl + p, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...docs.map((p) => ({ url: siteUrl + p, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
