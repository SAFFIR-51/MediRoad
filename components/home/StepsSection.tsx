import { content } from "@/lib/site";

/** 개원 프로세스 5단계 (홈 · 개원컨설팅 페이지 공용) */
export function StepsGrid() {
  return (
    <div className="mr-steps aos">
      {content.steps.items.map((s) => (
        <div className="step" key={s.no}>
          <em>{s.no}</em>
          <h5>{s.title}</h5>
          <ul>{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}

export default function StepsSection() {
  const st = content.steps;
  return (
    <section className="main_con sec_steps" id="process">
      <div className="tt taC">
        <h3><span><b>{st.title}</b></span></h3>
        <h4>[ {st.en} ]</h4>
        <p>{st.desc}</p>
      </div>
      <div className="wrap"><StepsGrid /></div>
    </section>
  );
}
