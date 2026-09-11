"use client";

/**
 * 개원 실적 로고월. 권역(서울·경기) 탭으로 걸러 본다.
 * 로고 파일이 있는 병원은 로고를, 없는 병원은 병원명 워드마크 타일을 보여준다 (lib/clinics.ts 참고).
 */
import { useState } from "react";
import type { Clinic } from "@/lib/clinics";

export default function ClinicWall({ items }: { items: Clinic[] }) {
  const areas = [...new Set(items.map((c) => c.area))];
  const [area, setArea] = useState("");
  const list = area ? items.filter((c) => c.area === area) : items;

  return (
    <>
      <div className="mr-wall-tabs">
        <button type="button" className={area === "" ? "on" : ""} onClick={() => setArea("")}>
          전체<small>{items.length}</small>
        </button>
        {areas.map((a) => (
          <button type="button" key={a} className={area === a ? "on" : ""} onClick={() => setArea(a)}>
            {a}<small>{items.filter((c) => c.area === a).length}</small>
          </button>
        ))}
      </div>
      <ul className="mr-wall">
        {list.map((c) => (
          <li key={c.name} className={c.logo ? "has-logo" : ""}>
            <div className="mark">
              {c.logo ? <img src={c.logo} alt={c.name} loading="lazy" /> : <strong>{c.name}</strong>}
            </div>
            <em>{c.dept === "기타" ? c.region : `${c.dept} · ${c.region}`}</em>
          </li>
        ))}
      </ul>
    </>
  );
}
