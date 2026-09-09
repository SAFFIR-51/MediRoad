/** 매물 관련 순수 헬퍼 (DB 의존 없음 — 클라이언트 컴포넌트에서도 사용) */
import type { ListingRow } from "@/lib/db/schema";

export const TYPE_LABEL: Record<string, string> = { lease: "임대·분양", sale: "병원매매" };

export type Listing = Omit<ListingRow, "features" | "images"> & { features: string[]; images: string[] };

export function parseListing(r: ListingRow): Listing {
  const j = (s: string | null) => { try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v.map(String) : []; } catch { return []; } };
  return { ...r, features: j(r.features), images: j(r.images) };
}

export const listingUrl = (code: string) => `/location/${encodeURIComponent(code)}`;
export const fmtDate = (d?: string | null) => (d ? d.slice(0, 10).replace(/-/g, ".") : "");
export const typeLabel = (t: string) => TYPE_LABEL[t] ?? t;

/** 보증금/매매가/분양가 라벨 분리 */
export function priceLabel(deposit: string | null | undefined) {
  const d = deposit || "";
  const label = /매매가/.test(d) ? "매매가" : /분양가/.test(d) ? "분양가" : "보증금";
  return { label, value: d.replace(/^(매매가|분양가) /, "") };
}
