import Link from "next/link";
import SubTop from "@/components/layout/SubTop";
import FieldIndex from "@/components/service/FieldIndex";
import { content, subtopFor, GROUPS, type ProcessStep } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/partners", {
  title: "파트너",
  description: "개원 및 경영 컨설팅부터 마케팅, 인테리어, 장비, 소모품, 폐기물, 부동산 중개까지 필요한 분야를 살펴보세요.",
});

/** 파트너 소개: 분야 목록(7개) → 연결 절차 → 입지 분석 안내. 입지 분석 · 개원 지원 소개 페이지와 같은 구성 */
export default function PartnersPage() {
  const c = content as unknown as { partnersIntro: { title: string; desc: string }; partnersProcess: ProcessStep[]; partners: { note: string } };
  const top = subtopFor("/partners", {});
  return (
    <>
      <SubTop {...top} bg={GROUPS.partners.bg} />
      <FieldIndex group="partners" intro={c.partnersIntro} />
      <section className="sub_con sec_process">
        <div className="wrap">
          <div className="tt taC">
            <em>PROCESS</em>
            <h3><span><b>파트너 연결 절차</b></span></h3>
          </div>
          <div className="mr-svc-steps aos">
            {c.partnersProcess.map((st) => (
              <div className="step" key={st.no}>
                <div className="top"><i className={st.icon}></i><em>{st.no}</em></div>
                <h5>{st.title}</h5>
                <p>{st.desc}</p>
              </div>
            ))}
          </div>
          <p className="mr-pf-note">{c.partners.note}</p>
        </div>
      </section>
      <section className="sub_con sec_bridge">
        <div className="wrap">
          <div className="mr-bridge aos">
            <div>
              <em>{GROUPS.analysis.en}</em>
              <h4>모든 준비의 출발점은 입지입니다</h4>
              <p>후보지의 배후 수요와 경쟁 환경을 먼저 확인하면 공간·장비·마케팅 계획도 더 정확해집니다.</p>
            </div>
            <Link className="mr-btn" href={GROUPS.analysis.href}>입지 분석 보기</Link>
          </div>
        </div>
      </section>
    </>
  );
}
