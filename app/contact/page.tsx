import type { Metadata } from "next";
import { Suspense } from "react";
import SubTop from "@/components/layout/SubTop";
import ContactSection from "@/components/contact/ContactSection";
import { content, subtopFor } from "@/lib/site";

export const metadata: Metadata = { title: "상담신청", description: "메디로드 개원 상담 신청. 진료과·희망 지역·예산을 알려주시면 가능한 입지와 일정을 정리해 드립니다." };

/** 상담신청: 원본 sec_contact 스타일의 상담 폼 + 같은 섹션 아래에 상담 절차 3단계 */
export default function ContactPage() {
  const top = subtopFor("/contact");
  return (
    <>
      <SubTop {...top} />
      <Suspense fallback={null}><ContactSection sub steps={content.contactSteps} /></Suspense>
    </>
  );
}
