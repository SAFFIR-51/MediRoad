"use client";

/** 개원입지 목록: 유형 탭 + 지역/업종 필터 + 지도(Leaflet) */
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import ListingCard from "./ListingCard";
import type { Listing } from "@/lib/listing-utils";
import { TYPE_LABEL } from "@/lib/listing-utils";

const ListingMap = dynamic(() => import("./ListingMap"), { ssr: false, loading: () => <div className="mr-map" /> });

export default function ListingBrowser({ items, initialType }: { items: Listing[]; initialType: "all" | "lease" | "sale" }) {
  const [type, setType] = useState<"all" | "lease" | "sale">(initialType);
  const [region, setRegion] = useState("");
  const [cat, setCat] = useState("");

  useEffect(() => { setType(initialType); }, [initialType]);
  useEffect(() => {
    const q = type === "all" ? "" : `?type=${type}`;
    window.history.replaceState(null, "", window.location.pathname + q + window.location.hash);
  }, [type]);

  const regions = useMemo(() => [...new Set(items.map((l) => (l.region || "").trim().split(" ")[0]).filter(Boolean))], [items]);
  const cats = useMemo(() => [...new Set(items.map((l) => l.category))], [items]);
  const filtered = items.filter((l) => (type === "all" || l.type === type) && (!region || (l.region || "").trim().split(" ")[0] === region) && (!cat || l.category === cat));

  const tab = (k: "all" | "lease" | "sale", label: string) => (
    <button type="button" className={type === k ? "on" : ""} onClick={() => setType(k)} key={k}>{label}</button>
  );

  return (
    <>
      <ListingMap items={filtered} />
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
        {filtered.map((l) => <ListingCard l={l} key={l.id} />)}
      </div>
      <div className={`mr-empty${filtered.length ? "" : " show"}`}>조건에 맞는 매물이 없습니다. 상담을 신청해 주시면 비공개 매물을 안내해 드립니다.</div>
    </>
  );
}
