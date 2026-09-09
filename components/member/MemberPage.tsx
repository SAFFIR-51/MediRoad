import SubTop from "@/components/layout/SubTop";
import { BenefitStrip } from "@/components/ui/PhotoStrip";
import { content } from "@/lib/site";

/** 회원 페이지 공통 틀: 작은 서브비주얼 + 폼 + 회원 혜택 스트립 */
export default function MemberPage({ en, title, desc, children }: { en: string; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <>
      <SubTop en={en} title={title} desc={desc} compact />
      <section className="sub_con mr-page sec_white">
        <div className="wrap">
          {children}
          <BenefitStrip items={content.benefits} />
        </div>
      </section>
    </>
  );
}
