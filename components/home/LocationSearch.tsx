"use client";

/** 추천 개원지 섹션의 지역·업종 검색바. 검색하면 조건이 걸린 개원입지 목록(/location)으로 이동한다. */
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LocationSearch({ regions, categories }: { regions: string[]; categories: string[] }) {
  const router = useRouter();
  const [region, setRegion] = useState("");
  const [cat, setCat] = useState("");

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (region) q.set("region", region);
    if (cat) q.set("cat", cat);
    const s = q.toString();
    router.push(`/location${s ? `?${s}` : ""}#list`);
  };

  return (
    <form className="mr-locsearch aos" onSubmit={search} role="search">
      <div className="f">
        <label htmlFor="loc-region">지역</label>
        <select id="loc-region" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">전체</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="f">
        <label htmlFor="loc-cat">업종</label>
        <select id="loc-cat" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">전체</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <button type="submit"><i className="xi-search"></i><span>개원입지 검색</span></button>
    </form>
  );
}
