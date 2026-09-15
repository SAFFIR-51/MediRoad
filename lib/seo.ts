/**
 * 페이지별 검색 노출 문구 (content/seo.json).
 * 각 page.tsx 는 `export const metadata = pageMeta("/about")` 처럼 경로만 넘긴다.
 * seo.json 에 없는 경로는 fallback 문구를 쓰고, 그것도 없으면 전역 문구를 쓴다.
 */
import type { Metadata } from "next";
import seoJson from "@/content/seo.json";
import { site } from "@/lib/site";

type Entry = { title?: string; description?: string; keywords?: string[] };

const seo = seoJson as unknown as { global: { title: string; description: string; keywords: string[] }; pages: Record<string, Entry> };

export const seoGlobal = seo.global;
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || site.siteUrl).replace(/\/$/, "");

/** "/about" → "/about/" (trailingSlash 내보내기와 같은 표기) */
export const canonicalPath = (path: string) => (path === "/" ? "/" : `${path.replace(/\/+$/, "")}/`);

export function pageMeta(path: string, fallback: Entry = {}, opts: { noindex?: boolean } = {}): Metadata {
  const key = path === "/" ? "/" : path.replace(/\/+$/, "");
  const e: Entry = { ...fallback, ...(seo.pages[key] ?? {}) };
  const title = e.title || fallback.title;
  const description = e.description || seoGlobal.description;
  const keywords = e.keywords?.length ? e.keywords : seoGlobal.keywords.slice(0, 20);
  const url = canonicalPath(key);
  // 브랜드명이 이미 들어간 제목은 레이아웃 템플릿(" | 메디로드")을 붙이지 않는다
  const t: Metadata["title"] = !title ? undefined : title.includes(site.brand.name) ? { absolute: title } : title;
  return {
    title: t,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: site.brand.title,
      title: title ? (title.includes(site.brand.name) ? title : `${title} | ${site.brand.name}`) : seoGlobal.title,
      description,
      url,
      images: [{ url: site.brand.logo.og, width: 1200, height: 630 }],
    },
    ...(opts.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
