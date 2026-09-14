import ClinicWall from "@/components/about/ClinicWall";
import { content } from "@/lib/site";
import { clinics } from "@/lib/clinics";

/**
 * 함께 개원한 병·의원 (개원 실적). 데이터: content/content.json portfolio.groups
 * 두 줄로 흘러가는 로고월. 로고 파일은 public/brand/clients/ 에 병원명으로 넣으면 자동 반영된다.
 */
export default function PortfolioSection({ sub = false }: { sub?: boolean }) {
  const p = content.portfolio;
  const list = clinics();
  return (
    <section className={`${sub ? "sub_con" : "main_con"} sec_portfolio`} id="portfolio">
      <div className="tt taC">
        {sub ? <em>PORTFOLIO</em> : null}
        <h3><span><b>{p.title}</b></span></h3>
        {!sub ? <h4 className="en">{p.en}</h4> : null}
        <p>{p.desc}</p>
      </div>
      <div className="wrap">
        <div className="aos2">
          <ClinicWall items={list} />
        </div>
        <p className="mr-pf-note">{p.note}</p>
      </div>
    </section>
  );
}
