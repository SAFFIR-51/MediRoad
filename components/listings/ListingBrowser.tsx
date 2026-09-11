"use client";

/** 개원입지 목록: 유형 탭 + 지역/업종 필터 + 매물 카드 */
import { useEffect, useMemo, useState } from "react";
import ListingCard from "./ListingCard";
import type { Listing } from "@/lib/listing-utils";
import { TYPE_LABEL, regionKey, regionsOf, categoriesOf } from "@/lib/listing-utils";

export default function ListingBrowser({ items, initialType, initialRegion = "", initialCat = "" }: { items: Listing[]; initialType: "all" | "lease" | "sale"; initialRegion?: string; initialCat?: string }) {
  const [type, setType] = useState<"all" | "lease" | "sale">(initialType);
  const [region, setRegion] = useState(initialRegion);
  const [cat, setCat] = useState(initialCat);

  useEffect(() => { setType(initialType); }, [initialType]);
  useEffect(() => { setRegion(initialRegion); }, [initialRegion]);
  useEffect(() => { setCat(initialCat); }, [initialCat]);
  useEffect(() => {
    // 홈 히어로 검색바에서 넘어온 조건도 주소에 유지한다
    const q = new URLSearchParams();
    if (type !== "all") q.set("type", type);
    if (region) q.set("region", region);
    if (cat) q.set("cat", cat);
    const s = q.toString();
    window.history.replaceState(null, "", window.location.pathname + (s ? `?${s}` : "") + window.location.hash);
  }, [type, region, cat]);

  const regions = useMemo(() => regionsOf(items), [items]);
  const cats = useMemo(() => categoriesOf(items), [items]);
  const filtered = items.filter((l) => (type === "all" || l.type === type) && (!region || regionKey(l.region) === region) && (!cat || l.category === cat));

  const tab = (k: "all" | "lease" | "sale", label: string) => (
    <button type="button" className={type === k ? "on" : ""} onClick={() => setType(k)} key={k}>{label}</button>
  );

  return (
    <>
      <div className="mr-filter">
        <div className="tabs">{tab("all", "전체")}{tab("lease", TYPE_LABEL.lease)}{tab("sale", TYPE_LABEL.sale)}</div>
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
      <div className={`mr-empty${filtered.length ? "" : " show"}`}>조건에 맞는 매물이 없습니다. 상담을 신청해 주시면 비공개 매물을 안내해 드립니다.</div>
    </>
  );
}
