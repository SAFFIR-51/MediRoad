/**
 * 매물 타입·표시 헬퍼 (API 응답 형식은 docs/개편_사양.md 6장 Listing JSON).
 * 가격은 만원 단위 정수로만 저장하므로 "협의"만 적힌 매물은 존재할 수 없다 (공인중개사법 표시·광고 명시사항).
 */

export type DealType = "임대" | "분양" | "매매";
export type ListingStatus = "open" | "closed" | "hidden";

export type Listing = {
  id: number;
  code: string;
  dealType: DealType;
  category: string;
  title: string;
  region: string;
  address: string;
  depositManwon: number | null;
  rentManwon: number | null;
  salePriceManwon: number | null;
  priceNote: string;
  areaM2: number;
  floorCurrent: string;
  floorTotal: number;
  useType: string;
  approvalDate: string;
  direction: string;
  parking: number;
  maintenanceManwon: number;
  moveIn: string;
  violation: boolean;
  features: string[];
  description: string;
  images: string[];
  lat: number | null;
  lng: number | null;
  status: ListingStatus;
  isSample: boolean;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Tab = "all" | "lease" | "sale";
export const TAB_LABEL: Record<Tab, string> = { all: "전체", lease: "임대·분양", sale: "병원 매매" };
export const tabOf = (d: DealType): Exclude<Tab, "all"> => (d === "매매" ? "sale" : "lease");

export const DEAL_TYPES: DealType[] = ["임대", "분양", "매매"];
export const STATUS_LABEL: Record<ListingStatus, string> = { open: "노출", closed: "거래완료", hidden: "비노출" };
export const CATEGORY_OPTIONS = ["의원", "치과", "한의원", "병원", "약국", "검진센터", "기타"];
export const USE_OPTIONS = ["제1종 근린생활시설", "제2종 근린생활시설", "의료시설", "업무시설", "판매시설"];
export const DIRECTION_OPTIONS = ["남향", "동향", "서향", "북향", "남동향", "남서향", "북동향", "북서향"];
export const MOVEIN_OPTIONS = ["즉시 입주", "협의 후 입주"];

export const listingUrl = (code: string) => `/location/view/?code=${encodeURIComponent(code)}`;
export const fmtDate = (d?: string | null) => (d ? d.slice(0, 10).replace(/-/g, ".") : "");

/** 13000 → "1억 3,000만원", 1300 → "1,300만원", 20000 → "2억원" */
export function fmtManwon(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "";
  if (n === 0) return "0원";
  const eok = Math.floor(n / 10000);
  const man = n % 10000;
  return `${eok ? `${eok.toLocaleString("ko-KR")}억` : ""}${eok && man ? " " : ""}${man ? `${man.toLocaleString("ko-KR")}만` : ""}원`;
}

const PYEONG = 3.3058;
export const pyeong = (m2: number) => Math.round((m2 / PYEONG) * 10) / 10;
export const areaLabel = (m2: number | null | undefined) => (m2 ? `전용 ${Number(m2).toLocaleString("ko-KR")}㎡ (약 ${Math.round(m2 / PYEONG)}평)` : "");

export function floorLabel(cur: string, total: number | null | undefined) {
  if (!cur) return "";
  const c = /^b/i.test(cur) ? `지하 ${cur.replace(/^b/i, "")}층` : `${cur}층`;
  return total ? `${c} / 총 ${total}층` : c;
}

export const maintenanceLabel = (n: number | null | undefined) => (n == null ? "" : n === 0 ? "없음" : `월 ${fmtManwon(n)}`);
export const parkingLabel = (n: number | null | undefined) => (n == null ? "" : n === 0 ? "주차 불가" : `${n}대`);

/** 카드·요약에 쓰는 대표 가격 한 줄 */
export function priceMain(l: Pick<Listing, "dealType" | "depositManwon" | "rentManwon" | "salePriceManwon">): { label: string; value: string } {
  if (l.dealType === "임대") return { label: "보증금 / 월세", value: `${fmtManwon(l.depositManwon)} / 월 ${fmtManwon(l.rentManwon)}` };
  if (l.dealType === "분양") return { label: "분양가", value: fmtManwon(l.salePriceManwon) };
  return { label: "매매가", value: fmtManwon(l.salePriceManwon) };
}

/** 상세 표의 가격 행 */
export function priceRows(l: Listing): [string, string][] {
  const rows: [string, string][] = [];
  if (l.dealType === "임대") {
    rows.push(["보증금", fmtManwon(l.depositManwon)], ["월세", `월 ${fmtManwon(l.rentManwon)}`]);
  } else {
    rows.push([l.dealType === "분양" ? "분양가" : "매매가", fmtManwon(l.salePriceManwon)]);
    if (l.depositManwon) rows.push(["보증금", fmtManwon(l.depositManwon)]);
    if (l.rentManwon) rows.push(["월세", `월 ${fmtManwon(l.rentManwon)}`]);
  }
  if (l.priceNote) rows.push(["가격 참고", l.priceNote]);
  return rows;
}

/** 지역 대분류(첫 어절)·업종 목록 — 홈 검색바와 매물 목록 필터가 같은 기준을 쓴다 */
export const regionKey = (region: string | null | undefined) => (region || "").trim().split(" ")[0];
export const regionsOf = (items: Listing[]) => [...new Set(items.map((l) => regionKey(l.region)).filter(Boolean))];
export const categoriesOf = (items: Listing[]) => [...new Set(items.map((l) => l.category).filter(Boolean))];
