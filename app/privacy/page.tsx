import type { Metadata } from "next";
import SubTop from "@/components/layout/SubTop";
import { subtopFor, site } from "@/lib/site";
import { privacySections } from "@/lib/privacy";

export const metadata: Metadata = { title: "개인정보처리방침" };

export default function PrivacyPage() {
  return (
    <>
      <SubTop {...subtopFor("/privacy")} compact />
      <section className="sub_con sec_white">
        <div className="wrap">
          <div className="mr-doc">
            {privacySections.map((s) => <div key={s.h}><h4>{s.h}</h4><p>{s.p}</p></div>)}
            <div className="eff">시행일자 : {site.privacy.effectiveDate}</div>
          </div>
        </div>
      </section>
    </>
  );
}
