import { roadmap } from "@/lib/site";

/**
 * 개원 로드맵: 6단계를 아이콘 흐름도로 한눈에, 분야별 체크 포인트는 아이콘 타일로.
 * 세부 체크리스트(content/roadmap.json 의 items)는 화면에 펼치지 않고 상담 시 제공한다.
 */
export default function RoadmapSections() {
  const r = roadmap;
  return (
    <>
      <section className="sub_con sec_roadmap" id="roadmap">
        <div className="wrap">
          <div className="tt taC">
            <em>ROADMAP</em>
            <h3><span><b>개원 Roadmap</b></span></h3>
            <p>입지 확정부터 가오픈까지, 메디로드가 함께 가는 6단계입니다.</p>
          </div>
          <ol className="mr-flow aos">
            {r.steps.map((s, i) => (
              <li key={s.no}>
                <div className="ic"><i className={s.icon}></i><em>{String(i + 1).padStart(2, "0")}</em></div>
                <h5>{s.short}</h5>
                <p>{s.brief}</p>
              </li>
            ))}
          </ol>
          <p className="mr-flow-note">단계별 세부 체크리스트는 상담 시 원장님 일정에 맞춰 드립니다.</p>
        </div>
      </section>

      <section className="sub_con sec_timeline">
        <div className="wrap">
          <div className="tt taC">
            <em>CHECK POINTS</em>
            <h3><span><b>분야별 체크 포인트</b></span></h3>
            <p>개원 준비에서 반드시 거치는 아홉 가지 영역입니다.</p>
          </div>
          <div className="mr-areas aos">
            {r.timeline.rows.map((row) => (
              <div className="item" key={row.label}>
                <i className={row.icon}></i>
                <h5>{row.label}</h5>
                <p>{row.brief}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
