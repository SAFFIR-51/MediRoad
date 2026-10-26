import SubTop from "@/components/layout/SubTop";
import ContactSection from "@/components/contact/ContactSection";
import { content, subtopFor } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import HubFaq from "@/components/service/HubFaq";
import JsonLd from "@/components/seo/JsonLd";
import { hubFaq, breadcrumbLd } from "@/lib/aeo";

export const metadata = pageMeta("/contact", { title: "상담신청" });

/** 상담신청: 상담 폼(PHP API 로 접수) + 같은 섹션 아래에 상담 절차 3단계 */
export default function ContactPage() {
  const top = subtopFor("/contact");
  return (
    <>
      <JsonLd data={breadcrumbLd([["상담신청", "/contact/"]])} />
      <SubTop {...top} visual={top.visual || "report"} bg="contact" />
      <ContactSection steps={content.contactSteps} />
      <HubFaq items={hubFaq.general} title="상담 전 자주 묻는 질문" />
    </>
  );
}
