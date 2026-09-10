import type { Metadata } from "next";
import { Suspense } from "react";
import SubTop from "@/components/layout/SubTop";
import ContactSection from "@/components/contact/ContactSection";
import PhotoStrip from "@/components/ui/PhotoStrip";
import { content, subtopFor } from "@/lib/site";

export const metadata: Metadata = { title: "상담신청", description: "메디로드 개원 상담 신청. 진료과·희망 지역·예산을 알려주시면 가능한 입지와 일정을 정리해 드립니다." };

/** 상담신청: 절차 안내 + 원본 sec_contact 스타일의 상담 폼 */
export default function ContactPage() {
  const top = subtopFor("/contact");
  return (
    <>
      <SubTop {...top} />
      <PhotoStrip en="PROCESS" title="상담은 이렇게 진행됩니다" desc="접수부터 입지 투어까지, 세 단계로 빠르게 답을 드립니다." items={content.contactSteps} />
      <Suspense fallback={null}><ContactSection sub /></Suspense>
    </>
  );
}
