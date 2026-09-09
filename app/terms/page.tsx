import type { Metadata } from "next";
import SubTop from "@/components/layout/SubTop";
import { IconRow } from "@/components/ui/PhotoStrip";
import { content, subtopFor } from "@/lib/site";

export const metadata: Metadata = { title: "이용약관" };

export default function TermsPage() {
  const t = content.terms;
  return (
    <>
      <SubTop {...subtopFor("/terms")} compact />
      <IconRow items={content.policyIcons} />
      <section className="sub_con sec_white">
        <div className="wrap">
          <div className="mr-doc">
            {t.sections.map((s) => <div key={s.h}><h4>{s.h}</h4><p>{s.p}</p></div>)}
            <div className="eff">시행일자 : {t.effective}</div>
          </div>
        </div>
      </section>
    </>
  );
}
