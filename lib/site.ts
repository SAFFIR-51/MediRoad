/**
 * 사이트 설정·문구 데이터 (content/*.json)
 * 사업자 정보는 site.config.json, 페이지 문구는 content.json, 매물 초기 데이터는 listings.json 에서 관리한다.
 */
import siteJson from "@/content/site.config.json";
import contentJson from "@/content/content.json";
import listingsJson from "@/content/listings.json";
import servicesJson from "@/content/services.json";
import roadmapJson from "@/content/roadmap.json";

export type MenuItem = { label: string; en?: string; href: string; children?: { label: string; href: string }[] };
export type SubTopText = { en: string; title: string; desc: string };

export const site = siteJson;
export const content = contentJson;
export const seedListings = listingsJson.items;
export const services = servicesJson.items;
export const roadmap = roadmapJson;

export const menuItems = site.menu.items as MenuItem[];
export const pageTexts = site.pages as unknown as Record<string, SubTopText>;

export function subtopFor(path: string, fallback?: Partial<SubTopText>): SubTopText {
  const t = pageTexts[path];
  return { en: fallback?.en ?? t?.en ?? "", title: fallback?.title ?? t?.title ?? site.brand.name, desc: fallback?.desc ?? t?.desc ?? "" };
}

export function pageTitle(title?: string) {
  return title ? `${title} | ${site.brand.title}` : site.brand.title;
}

/** 주소가 자리표시(00구/00로)인지 여부. 자리표시면 지도를 숨기고 안내를 표시한다. */
export function hasRealAddress(addr: string) {
  return !!addr && !/00구|00로/.test(addr);
}
