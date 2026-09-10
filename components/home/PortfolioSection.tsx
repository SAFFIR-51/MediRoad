import { content } from "@/lib/site";

/**
 * 함께 개원한 병·의원 (개원 실적). 데이터: content/content.json portfolio.groups
 * 홈에는 요약(숫자 + 지역별 병원명 태그), 회사소개에는 같은 구성을 흰 배경으로.
 */
export default function PortfolioSection({ sub = false }: { sub?: boolean }) {
  const p = content.portfolio;
  const all = p.groups.flatMap((g) => g.items);
  const depts = new Set<string>();
  const DEPT = ["이비인후과", "재활의학과", "소아청소년과", "소아과", "신경과", "정형외과", "피부과", "산부인과", "내과", "교정치과", "치과", "외과", "비뇨기과", "안과", "심장혈관흉부외과", "신경외과", "통증의학과"];
  all.forEach((n) => DEPT.forEach((d) => { if (n.includes(d)) depts.add(d === "소아과" ? "소아청소년과" : d === "치과" && n.includes("교정치과") ? "교정치과" : d); }));
  const stats = [
    { n: `${all.length}`, unit: "곳", label: "개원 진행 병·의원" },
    { n: `${depts.size}`, unit: "개", label: "진료과목" },
    { n: `${p.groups.length}`, unit: "개 권역", label: "서울 · 경기 주요 지역" },
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
          {stats.map((s) => <div className="item" key={s.label}><b>{s.n}<small>{s.unit}</small></b><em>{s.label}</em></div>)}
        </div>
        <div className="mr-pf-groups aos2">
          {p.groups.map((g) => (
            <div className="grp" key={g.region}>
              <h5><i className="xi-map-marker"></i>{g.region}<small>{g.items.length}</small></h5>
              <ul>{g.items.map((n) => <li key={n}>{n}</li>)}</ul>
            </div>
          ))}
        </div>
        <p className="mr-pf-note">{p.note}</p>
      </div>
    </section>
  );
}
