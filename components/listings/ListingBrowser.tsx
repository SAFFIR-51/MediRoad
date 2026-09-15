"use client";

/** 매물 목록: 유형 탭(임대·분양 / 병원 매매) + 지역·업종 필터 + 매물 카드 */
import { useEffect, useMemo, useState } from "react";
import ListingCard from "./ListingCard";
import { TAB_LABEL, tabOf, regionKey, regionsOf, categoriesOf, type Listing, type Tab } from "@/lib/listing-utils";

export default function ListingBrowser({ items, initialType, initialRegion = "", initialCat = "" }: { items: Listing[]; initialType: Tab; initialRegion?: string; initialCat?: string }) {
  const [type, setType] = useState<Tab>(initialType);
  const [region, setRegion] = useState(initialRegion);
  const [cat, setCat] = useState(initialCat);

  useEffect(() => { setType(initialType); }, [initialType]);
  useEffect(() => {
    // 필터 조건을 주소에 유지한다 (새로고침·공유 시 같은 목록)
    const q = new URLSearchParams();
    if (type !== "all") q.set("type", type);
    if (region) q.set("region", region);
    if (cat) q.set("cat", cat);
    const s = q.toString();
    window.history.replaceState(window.history.state, "", window.location.pathname + (s ? `?${s}` : "") + window.location.hash);
  }, [type, region, cat]);

  const regions = useMemo(() => regionsOf(items), [items]);
  const cats = useMemo(() => categoriesOf(items), [items]);
  const filtered = items.filter((l) => (type === "all" || tabOf(l.dealType) === type) && (!region || regionKey(l.region) === region) && (!cat || l.category === cat));

  return (
    <>
      <div className="mr-filter">
        <div className="tabs">
          {(["all", "lease", "sale"] as Tab[]).map((k) => (
            <button type="button" className={type === k ? "on" : ""} onClick={() => setType(k)} key={k}>{TAB_LABEL[k]}</button>
          ))}
        </div>
        <div className="sel">
          <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="지역">
            <option value="">지역 전체</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="업종">
            <option value="">업종 전체</option>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="count">총 <b>{filtered.length}</b>건</span>
        </div>
      </div>
      <div className="mr-cards" id="cards">
        {filtered.map((l) => <ListingCard l={l} key={l.code} />)}
      </div>
      <div className={`mr-empty${filtered.length ? "" : " show"}`}>조건에 맞는 매물이 없습니다. 원하시는 지역·진료과를 상담으로 알려주시면 입지 분석과 함께 검토해 드립니다.</div>
    </>
  );
}
