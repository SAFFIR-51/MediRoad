import { Suspense } from "react";
import SubTop from "@/components/layout/SubTop";

/** 회원 화면 공통 틀: 짧은 상단 비주얼 + 흰 배경 폼 영역 */
export default function AuthPage({ en, title, children }: { en: string; title: string; children: React.ReactNode }) {
  return (
    <>
      <SubTop en={en} title={title} compact bg="contact" />
      <section className="sub_con sec_white mr-auth">
        <div className="wrap">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </section>
    </>
  );
}
