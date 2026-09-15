import SubTop from "@/components/layout/SubTop";
import ContactSection from "@/components/contact/ContactSection";
import { content, subtopFor } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/contact", { title: "상담신청" });

/** 상담신청: 상담 폼(PHP API 로 접수) + 같은 섹션 아래에 상담 절차 3단계 */
export default function ContactPage() {
  const top = subtopFor("/contact");
  return (
    <>
      <SubTop {...top} visual={top.visual || "report"} bg="contact" />
      <ContactSection steps={content.contactSteps} />
    </>
  );
}
