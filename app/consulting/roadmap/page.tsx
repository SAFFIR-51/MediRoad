import type { Metadata } from "next";
import SubTop from "@/components/layout/SubTop";
import { roadmap } from "@/lib/site";

export const metadata: Metadata = { title: "개원 로드맵", description: "메디로드가 컨설팅 현장에서 쓰는 6단계 개원 체크리스트와 분야별 개원 타임라인" };

/** 대표님 자료(개원 Roadmap · 개원 타임라인). 프론트 단계에서는 전체 공개. */
export default function RoadmapPage() {
  const r = roadmap;
  return (
    <>
      <SubTop en={r.en} title={r.title} desc="입지 확정부터 가오픈까지, 메디로드의 6단계 개원 체크리스트" />
      <section className="sub_con sec_cintro">
        <div className="tt taC aos">
          <em>ROADMAP</em>
          <h4>개원, <b>순서대로 챙기면</b> 어렵지 않습니다</h4>
          <p>{r.desc}</p>
        </div>
      </section>

      <section className="sub_con sec_roadmap">
        <div className="wrap">
          <div className="tt taC">
            <em>6 STEPS</em>
            <h3><span><b>개원 Roadmap</b></span></h3>
            <p>단계별 체크리스트입니다. 항목을 하나씩 확인하며 진행하세요.</p>
          </div>
          <div className="mr-roadmap aos">
            {r.steps.map((s) => (
              <div className="step" key={s.no}>
                <div className="head"><em>{s.no}</em><h5>{s.title}</h5></div>
                <p className="sum">{s.summary}</p>
                <div className="body">
                  {s.items.map((it) => (
                    <div className="grp" key={it.h}>
                      <h6>{it.h}</h6>
                      <ul>{it.p.map((p) => <li key={p}>{p}</li>)}</ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sub_con sec_timeline">
        <div className="wrap">
          <div className="tt taC">
            <em>TIMELINE</em>
            <h3><span><b>{r.timeline.title}</b></span></h3>
            <p>{r.timeline.desc}</p>
          </div>
          <div className="mr-timeline2 aos">
            {r.timeline.rows.map((row) => (
              <div className="row" key={row.label}>
                <div className="lb">{row.label}</div>
                <div className="items">{row.items.map((it) => <span key={it}>{it}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
