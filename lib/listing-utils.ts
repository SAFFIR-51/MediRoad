/** 매물 관련 타입·순수 헬퍼 (서버/DB 의존 없음 — 클라이언트 컴포넌트에서도 사용) */

export const TYPE_LABEL: Record<string, string> = { lease: "임대·분양", sale: "병원매매" };

export type ListingType = "lease" | "sale";

export type Listing = {
  code: string;
  type: ListingType;
  category: string;
  title: string;
  region: string;
  address: string;
  dateListed: string;
  deposit: string;
  rent: string;
  area: string;
  floor: string;
  /** 인터넷 표시·광고 명시사항: 건축물 용도, 사용승인일, 방향, 주차대수, 관리비, 입주가능일, 위반건축물 여부 */
  use: string;
  approvalDate: string;
  direction: string;
  parking: string;
  maintenance: string;
  moveIn: string;
  violation: boolean;
  features: string[];
  images: string[];
  description: string;
  lat: number | null;
  lng: number | null;
  isSample: boolean;
  status: "open" | "closed";
};

export const listingUrl = (code: string) => `/location/${encodeURIComponent(code)}`;
export const fmtDate = (d?: string | null) => (d ? d.slice(0, 10).replace(/-/g, ".") : "");
export const typeLabel = (t: string) => TYPE_LABEL[t] ?? t;

/** 보증금/매매가/분양가 라벨 분리 */
export function priceLabel(deposit: string | null | undefined) {
  const d = deposit || "";
  const label = /매매가/.test(d) ? "매매가" : /분양가/.test(d) ? "분양가" : "보증금";
  return { label, value: d.replace(/^(매매가|분양가) /, "") };
}

/** 지역 대분류(첫 어절)·업종 목록 — 홈 히어로 검색바와 입지 목록 필터가 같은 기준을 쓴다 */
export const regionKey = (region: string | null | undefined) => (region || "").trim().split(" ")[0];
export const regionsOf = (items: Listing[]) => [...new Set(items.map((l) => regionKey(l.region)).filter(Boolean))];
export const categoriesOf = (items: Listing[]) => [...new Set(items.map((l) => l.category).filter(Boolean))];
