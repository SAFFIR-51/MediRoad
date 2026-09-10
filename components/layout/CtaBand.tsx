"use client";

/** 모든 하위 페이지 마지막에 붙는 공통 CTA (홈은 자체 상담 안내 섹션, 상담신청 페이지는 제외) */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

export default function CtaBand() {
  const pathname = usePathname();
  if (pathname === "/" || pathname.startsWith("/contact")) return null;
  const tel = site.contact.headerTel;
  return (
    <section className="sub_con mr-cta mr-cta-band">
      <div className="wrap">
        <em className="aos">CONTACT US</em>
        <h4 className="aos">개원, 어디서부터 시작해야 할지 막막하신가요?</h4>
        <p className="aos2">진료과 · 희망 지역 · 예산만 알려주시면 가능한 입지와 일정을 정리해 드립니다. 초기 상담은 무료입니다.</p>
        <div className="btns aos2">
          <Link href="/contact"><span>상담 신청하러 가기</span><i className="xi-long-arrow-right"></i></Link>
          <a className="line" href={`tel:${tel}`}><span><i className="xi-call"></i> {tel}</span></a>
        </div>
      </div>
    </section>
  );
}
