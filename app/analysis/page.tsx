import Link from "next/link";
import SubTop from "@/components/layout/SubTop";
import FieldIndex from "@/components/service/FieldIndex";
import AnalysisMethod from "@/components/analysis/AnalysisMethod";
import { content, subtopFor, GROUPS, type ProcessStep } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/analysis", { title: "입지 분석" });

/** 입지 분석 소개: 분야 목록(병·의원 · 약국 · 양수양도) → 분석 데이터 레이어 → 진행 절차 → 개원 지원 안내 */
export default function AnalysisPage() {
  const c = content as unknown as { analysisIntro: { title: string; desc: string }; analysisProcess: ProcessStep[] };
  const top = subtopFor("/analysis", {});
  return (
    <>
      <SubTop {...top} visual={top.visual || GROUPS.analysis.visual} bg="analysis" />
      <FieldIndex group="analysis" intro={c.analysisIntro} />
      <AnalysisMethod sub />
      {c.analysisProcess?.length ? (
        <section className="sub_con sec_process">
          <div className="wrap">
            <div className="tt taC">
              <em>PROCESS</em>
              <h3><span><b>입지 분석 진행 절차</b></span></h3>
            </div>
            <div className="mr-svc-steps aos">
              {c.analysisProcess.map((st) => (
                <div className="step" key={st.no}>
                  <div className="top"><i className={st.icon}></i><em>{st.no}</em></div>
                  <h5>{st.title}</h5>
                  <p>{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <section className="sub_con sec_bridge">
        <div className="wrap">
          <div className="mr-bridge aos">
            <div>
              <em>{GROUPS.support.en}</em>
              <h4>입지를 정한 다음, 개원까지 필요한 절차도 함께 챙깁니다</h4>
              <p>전문 행정사와 함께하는 인증·개설·허가 절차, 플라노바와 함께하는 경영마케팅, 폐업 정리까지 이어서 지원합니다.</p>
            </div>
            <Link className="mr-btn" href={GROUPS.support.href}>개원 지원 보기</Link>
          </div>
        </div>
      </section>
    </>
  );
}
