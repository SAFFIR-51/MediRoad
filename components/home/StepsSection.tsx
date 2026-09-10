import { content } from "@/lib/site";

/** 개원 프로세스 5단계: 아이콘 흐름도 (홈 · 컨설팅 소개 페이지 공용). 아이콘은 content.json steps.items[].icon (xeicon) */
export function StepsGrid() {
  return (
    <ol className="mr-process aos">
      {content.steps.items.map((s) => (
        <li key={s.no}>
          <div className="ic"><i className={s.icon}></i><em>{s.no}</em></div>
          <h5>{s.title}</h5>
          <ul>{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </li>
      ))}
    </ol>
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
