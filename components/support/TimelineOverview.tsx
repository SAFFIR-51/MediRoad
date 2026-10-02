import timeline from "@/content/opening-timeline.json";

/**
 * 개원 지원 소개: 전체 타임라인 한눈에 보기 (간트형 개요).
 * 분야별 트랙이 시점 열(계약 전 ~ 개원 주간)에 걸쳐 동시에 진행되는 모습을 보여 준다. 데이터: content/opening-timeline.json
 */
export default function TimelineOverview() {
  const { columns, tracks, steps } = timeline;
  const stepNo = (id: string) => String(steps.findIndex((s) => s.id === id) + 1).padStart(2, "0");
  return (
    <section className="sub_con sec_tl_overview" id="overview">
      <div className="wrap">
        <div className="mr-tl-head">
          <div className="mr-sec-head aos">
            <em className="mr-pill">Opening Timeline</em>
            <h3>개원 준비 <b>전체 일정</b>을<br />한눈에 확인하세요</h3>
            <p>임대차 계약 직후부터 첫 진료까지, 여러 준비가 동시에 진행됩니다. 무엇을 언제 시작하는지 먼저 살펴보세요.</p>
          </div>
          <ul className="mr-tl-learn aos2" aria-label="이 페이지에서 알 수 있는 내용">
            <li><i className="xi-check-circle"></i>개원 준비 전체 과정과 함께 진행할 일</li>
            <li><i className="xi-check-circle"></i>시점별로 시작해야 할 업무</li>
            <li><i className="xi-check-circle"></i>단계별 확인 사항과 법령 기준</li>
          </ul>
        </div>

        <div className="mr-gantt aos2" role="table" aria-label="분야별 개원 준비 시점">
          <div className="row head" role="row">
            <span className="lb" role="columnheader">준비 분야</span>
            {columns.map((c, i) => <span key={c} role="columnheader" className={i === columns.length - 1 ? "day" : ""}>{c}</span>)}
          </div>
          {tracks.map((t) => (
            <div className="row" role="row" key={t.label}>
              <span className="lb" role="rowheader">{t.label}</span>
              <span className="track" role="cell" aria-label={`${columns[t.from]}부터 ${columns[t.to]}까지`}>
                <a
                  className={`bar s${stepNo(t.step)}`}
                  href={`#stage-${t.step}`}
                  style={{ gridColumn: `${t.from + 1} / ${t.to + 2}` }}
                  title={`STEP ${stepNo(t.step)}에서 자세히 보기`}
                >
                  <em><span className="w">STEP </span>{stepNo(t.step)}</em>
                </a>
              </span>
            </div>
          ))}
        </div>
        <p className="mr-tl-note"><i className="xi-error-o"></i>일반적인 진행 순서를 보여 주는 예시입니다. 공사 범위, 건물 상태, 신고 준비에 따라 실제 기간은 달라집니다. 막대를 누르면 해당 단계의 체크리스트로 이동합니다.</p>
      </div>
    </section>
  );
}
