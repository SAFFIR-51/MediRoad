import Link from "next/link";
import SubTop from "@/components/layout/SubTop";
import FieldIndex from "@/components/service/FieldIndex";
import PartnersSection from "@/components/home/PartnersSection";
import { content, subtopFor, GROUPS } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/support", { title: "개원 지원" });

/** 개원 지원 소개: 분야 목록(인증·인허가 · 경영마케팅 · 폐업 정리) → 협력사 → 입지 분석 안내 */
export default function SupportPage() {
  const c = content as unknown as { supportIntro: { title: string; desc: string } };
  const top = subtopFor("/support", {});
  return (
    <>
      <SubTop {...top} visual={top.visual || GROUPS.support.visual} bg="support" />
      <FieldIndex group="support" intro={c.supportIntro} />
      <PartnersSection sub />
      <section className="sub_con sec_bridge">
        <div className="wrap">
          <div className="mr-bridge aos">
            <div>
              <em>{GROUPS.analysis.en}</em>
              <h4>모든 준비의 출발점은 입지입니다</h4>
              <p>후보지의 배후 수요와 경쟁 환경을 먼저 확인하면 인허가·마케팅 계획도 더 정확해집니다.</p>
            </div>
            <Link className="mr-btn" href={GROUPS.analysis.href}>입지 분석 보기</Link>
          </div>
        </div>
      </section>
    </>
  );
}
