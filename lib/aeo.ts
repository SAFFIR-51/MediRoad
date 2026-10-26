/**
 * AI 답변엔진(ChatGPT·구글 AI 개요·퍼플렉시티 등)과 검색엔진이 읽는 구조화 데이터·FAQ 모음.
 * 허브 페이지 FAQ 는 content/faq.json, 분야별 FAQ 는 services.json · lib/partner-guides.ts 에서 가져온다.
 * 같은 사업자를 가리키도록 모든 스키마가 ORG_ID 하나를 참조한다.
 */
import faqJson from "@/content/faq.json";
import timeline from "@/content/opening-timeline.json";
import { GROUPS, servicesIn, serviceHref, type ServiceGroup } from "@/lib/site";
import { partnerGuides } from "@/lib/partner-guides";
import { siteUrl } from "@/lib/seo";

export type Faq = { q: string; a: string };
export type HubFaqKey = "general" | "analysis" | "support" | "partners";

export const ORG_ID = `${siteUrl}/#organization`;
export const WEBSITE_ID = `${siteUrl}/#website`;

export const hubFaq = faqJson as unknown as Record<HubFaqKey, Faq[]>;

export const stripHtml = (html: string) => html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

/** 분야 페이지에 실제로 보이는 FAQ (파트너는 분야 가이드 FAQ 를 뒤에 더한다 — PartnerDetail 과 같은 순서) */
export function fieldFaq(group: ServiceGroup, slug: string): Faq[] {
  const s = servicesIn(group).find((x) => x.slug === slug);
  return [...(s?.faq ?? []), ...(group === "partners" ? partnerGuides[slug]?.faq ?? [] : [])];
}

/** 통합 FAQ(/faq/) 구성: 이용 안내 → 입지 분석 → 개원 지원 → 파트너. 분야별 문항은 출처 페이지 링크와 함께 */
export type FaqSection = { id: string; title: string; href?: string; items: (Faq & { from?: { title: string; href: string } })[] };

export function faqSections(): FaqSection[] {
  const groups: ServiceGroup[] = ["analysis", "support", "partners"];
  return [
    { id: "general", title: "메디로드 이용 안내", items: hubFaq.general },
    ...groups.map((g) => ({
      id: g,
      title: GROUPS[g].title,
      href: GROUPS[g].href,
      items: [
        ...hubFaq[g],
        ...servicesIn(g).flatMap((s) => fieldFaq(g, s.slug).map((f) => ({ ...f, from: { title: s.title, href: serviceHref(s) } }))),
      ],
    })),
  ];
}

export function faqPageLd(items: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: stripHtml(f.q), acceptedAnswer: { "@type": "Answer", text: stripHtml(f.a) } })),
  };
}

/** [["입지 분석", "/analysis/"], ...] → 홈부터 이어지는 BreadcrumbList */
export function breadcrumbLd(trail: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [["홈", "/"], ...trail].map(([name, href], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${siteUrl}${href}` })),
  };
}

/** 허브 페이지의 분야 목록 */
export function fieldListLd(group: ServiceGroup) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `메디로드 ${GROUPS[group].title} 분야`,
    itemListElement: servicesIn(group).map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.title, url: `${siteUrl}${serviceHref(s)}` })),
  };
}

/** 개원 지원(/support/) 6단계 개원 타임라인 → HowTo. "병원 개원 절차·순서" 질문에 단계 그대로 인용되도록 */
export function openingHowToLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "병·의원 개원 준비 6단계",
    description: "입지·계약부터 개원 주간까지 메디로드 개원 타임라인. 시점은 일반적인 진행 예시이며 실제 기간은 현장마다 다릅니다.",
    url: `${siteUrl}/support/`,
    step: timeline.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: `${s.when} · ${s.title}`,
      text: [s.desc, ...s.checks].join(" "),
      url: `${siteUrl}/support/#timeline`,
    })),
  };
}
