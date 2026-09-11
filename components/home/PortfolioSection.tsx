import ClinicWall from "@/components/about/ClinicWall";
import { content } from "@/lib/site";
import { clinics, clinicStats } from "@/lib/clinics";

/**
 * 함께 개원한 병·의원 (개원 실적). 데이터: content/content.json portfolio.groups
 * 요약 숫자 + 로고월(15곳씩 자동으로 넘어가는 슬라이더). 로고 파일은 public/brand/clients/ 에 병원명으로 넣으면 자동 반영된다.
 */
export default function PortfolioSection({ sub = false }: { sub?: boolean }) {
  const p = content.portfolio;
  const list = clinics();
  const s = clinicStats(list);
  const stats = [
    { n: `${s.total}`, unit: "곳", label: "개원 진행 병·의원" },
    { n: `${s.depts}`, unit: "개", label: "진료과목" },
    { n: `${s.regions}`, unit: "개 권역", label: "서울 · 경기 주요 지역" },
  ];
  return (
    <section className={`${sub ? "sub_con" : "main_con"} sec_portfolio`} id="portfolio">
      <div className="tt taC">
        {sub ? <em>PORTFOLIO</em> : null}
        <h3><span><b>{p.title}</b></span></h3>
        {!sub ? <h4 className="en">{p.en}</h4> : null}
        <p>{p.desc}</p>
      </div>
      <div className="wrap">
        <div className="mr-pf-stats aos">
          {stats.map((x) => <div className="item" key={x.label}><b>{x.n}<small>{x.unit}</small></b><em>{x.label}</em></div>)}
        </div>
        <div className="aos2">
          <ClinicWall items={list} />
        </div>
        <p className="mr-pf-note">{p.note}</p>
      </div>
    </section>
  );
}
