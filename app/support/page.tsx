import Link from "next/link";
import SubTop from "@/components/layout/SubTop";
import FieldIndex from "@/components/service/FieldIndex";
import TimelineOverview from "@/components/support/TimelineOverview";
import OpeningPlanner from "@/components/support/OpeningPlanner";
import { content, subtopFor, GROUPS, servicesIn } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/support", { title: "개원 지원" });

/**
 * 개원 지원 소개: 전체 타임라인(간트 개요) → 6단계 체크리스트 → 지원 분야(인증·인허가 · 폐업 정리) → 파트너 안내.
 * 오픈닥터 개원 가이드의 시간축·개요·체크 포인트 구성을 메디로드 공통 디자인(SubTop · sub_con · mr-*)으로 옮겼다.
 */
export default function SupportPage() {
  const c = content as unknown as { supportIntro: { title: string; desc: string } };
  const top = subtopFor("/support", {});
  return (
    <>
      <SubTop {...top} visual={top.visual || GROUPS.support.visual} bg={GROUPS.support.bg} />
      <TimelineOverview />
      <OpeningPlanner />
      <FieldIndex group="support" intro={c.supportIntro} />
      <section className="sub_con sec_bridge">
        <div className="wrap">
          <div className="mr-bridge aos">
            <div>
              <em>{GROUPS.partners.en}</em>
              <h4>공간 · 장비 · 마케팅까지, {servicesIn("partners").length}개 분야 파트너와 함께합니다</h4>
              <p>{servicesIn("partners").map((s) => s.title).join(", ")} 분야를 살펴보세요.</p>
            </div>
            <Link className="mr-btn" href={GROUPS.partners.href}>파트너 보기</Link>
          </div>
        </div>
      </section>
    </>
  );
}
