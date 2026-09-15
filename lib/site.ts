/**
 * 사이트 설정·문구 데이터 (content/*.json)
 * 사업자 정보·메뉴·페이지 상단 문구는 site.config.json, 페이지 문구는 content.json,
 * 입지 분석·개원 지원 분야별 페이지는 services.json, 검색 노출 문구는 seo.json, 오픈 팝업은 popup.json.
 * 매물은 정적 데이터가 아니라 PHP API(/api/listings.php)에서 읽는다.
 */
import siteJson from "@/content/site.config.json";
import contentJson from "@/content/content.json";
import servicesJson from "@/content/services.json";
import popupJson from "@/content/popup.json";

/** 분석 보드(components/analysis/AnalysisBoard) 종류 */
export type Visual =
  | "catchment" | "population" | "flow" | "competition" | "pharmacy" | "transfer"
  | "licensing" | "marketing" | "closure" | "report" | "map" | "";

export type MenuChild = { label: string; href: string; locOnly?: boolean };
export type MenuItem = { label: string; en?: string; href: string; locOnly?: boolean; children?: MenuChild[] };
export type SubTopText = { en: string; title: string; desc: string; visual?: Visual };

export type ServiceGroup = "analysis" | "support";
export type ProcessStep = { no: string; icon: string; title: string; desc: string };
export type Service = {
  slug: string;
  group: ServiceGroup;
  en: string;
  icon: string;
  title: string;
  short?: string;
  desc: string;
  image: string;
  visual?: Visual;
  headline: { light: string; bold: string };
  value: string;
  analysis?: { title: string; desc?: string; items: { icon: string; label: string; desc: string }[] };
  report?: { title: string; desc?: string; items: string[] };
  partner?: { label?: string; name: string; headline: string; desc: string; items?: string[]; note?: string; logo?: string };
  process?: ProcessStep[];
  keysDesc?: string;
  points?: { title: string; desc: string; image: string }[];
  faq?: { q: string; a: string }[];
};

export const site = siteJson;
export const content = contentJson;
export const services = servicesJson.items as unknown as Service[];
export const popups = popupJson.items;

export const menuItems = site.menu.items as MenuItem[];
export const pageTexts = site.pages as unknown as Record<string, SubTopText>;

export const GROUPS: Record<ServiceGroup, { title: string; en: string; href: string; visual: Visual }> = {
  analysis: { title: "입지 분석", en: "Site Analysis", href: "/analysis/", visual: "report" },
  support: { title: "개원 지원", en: "Opening Support", href: "/support/", visual: "licensing" },
};

export const servicesIn = (group: ServiceGroup) => services.filter((s) => s.group === group);
export const findService = (group: ServiceGroup, slug: string) => services.find((s) => s.group === group && s.slug === slug) ?? null;
export const serviceHref = (s: Pick<Service, "group" | "slug">) => `/${s.group}/${s.slug}/`;

export function subtopFor(path: string, fallback?: Partial<SubTopText>): SubTopText {
  const t = pageTexts[path];
  return {
    en: fallback?.en ?? t?.en ?? "",
    title: fallback?.title ?? t?.title ?? site.brand.name,
    desc: fallback?.desc ?? t?.desc ?? "",
    visual: fallback?.visual ?? t?.visual ?? "",
  };
}

/** 주소가 자리표시(00구/00로)인지 여부. 자리표시면 지도를 숨기고 안내를 표시한다. */
export function hasRealAddress(addr: string) {
  return !!addr && !/00구|00로/.test(addr);
}
