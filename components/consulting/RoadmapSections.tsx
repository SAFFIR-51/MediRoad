import { roadmap } from "@/lib/site";

/** 개원 로드맵(6단계 체크리스트) + 개원 타임라인. 병·의원 개원 컨설팅 페이지(/consulting/opening) 하단에 붙는다. */
export default function RoadmapSections() {
  const r = roadmap;
  return (
    <>
      <section className="sub_con sec_roadmap" id="roadmap">
        <div className="wrap">
          <div className="tt taC">
            <em>ROADMAP</em>
            <h3><span><b>개원 Roadmap</b></span></h3>
            <p>{r.desc}</p>
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
