"use client";

/**
 * 홈 분야 목록: 입지 분석 3 + 개원 지원 3.
 * 좌측 인덱스 목록 + 우측 대형 비주얼. 목록에 마우스를 올리거나 포커스하면 우측 사진이 교차 페이드된다.
 * 문구·사진은 site.config.json home.services (group: analysis | support).
 */
import { useState } from "react";
import Link from "next/link";
import { site, GROUPS, type ServiceGroup } from "@/lib/site";
import { Lines } from "@/components/ui/Text";

type Item = { en: string; title: string; desc: string[]; href: string; img: string; group?: ServiceGroup };

export default function ServicesSection() {
  const s = site.home.services as { en: string; title: string; desc: string; items: Item[] };
  const [cur, setCur] = useState(0);
  const active = s.items[cur];

  return (
    <section className="main_con sec_svcindex" id="fields">
      <div className="wrap">
        <div className="tt">
          <h4 className="en">{s.en}</h4>
          <h3><span><b>{s.title}</b></span></h3>
          <p>{s.desc}</p>
        </div>

        <div className="mr-svcindex aos">
          <ol className="list">
            {s.items.map((it, i) => {
              const newGroup = it.group && it.group !== s.items[i - 1]?.group;
              return (
                <li key={it.title} className={`${i === cur ? "on" : ""}${newGroup ? " group-start" : ""}`} onMouseEnter={() => setCur(i)}>
                  {newGroup && it.group ? <span className="grp">{GROUPS[it.group].title}</span> : null}
                  <Link href={it.href} onFocus={() => setCur(i)}>
                    <em className="no">{String(i + 1).padStart(2, "0")}</em>
                    <div className="txt">
                      <h4>{it.title}</h4>
                      <em className="en">{it.en}</em>
                      <p><Lines lines={it.desc} /></p>
                    </div>
                    <i className="xi-long-arrow-right"></i>
                  </Link>
                </li>
              );
            })}
          </ol>

          <div className="visual" aria-hidden="true">
            {s.items.map((it, i) => (
              <div className={`pic${i === cur ? " on" : ""}`} key={it.title} style={{ backgroundImage: `url(${it.img})` }} />
            ))}
            <div className="cap">
              <em>{active.group ? `${GROUPS[active.group].title} · ` : ""}{String(cur + 1).padStart(2, "0")} / {String(s.items.length).padStart(2, "0")}</em>
              <strong>{active.title}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
