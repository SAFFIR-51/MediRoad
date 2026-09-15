"use client";

/**
 * 하위 페이지 마지막에 붙는 공통 상담 CTA.
 * 홈(자체 상담 안내), 매물 정보(목록 아래 자체 CTA), 상담신청·회원·관리자 화면에서는 붙이지 않는다.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

const HIDE = ["/location", "/contact", "/login", "/signup", "/forgot-password", "/reset-password", "/admin"];

export default function CtaBand() {
  const pathname = (usePathname() || "/").replace(/\/+$/, "") || "/";
  if (pathname === "/" || HIDE.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  const tel = site.contact.headerTel;
  return (
    <section className="sub_con mr-cta mr-cta-band">
      <div className="wrap">
        <em className="aos">CONTACT US</em>
        <h4 className="aos">후보지, 계약 전에 데이터로 먼저 확인하세요</h4>
        <p className="aos2">진료과 · 희망 지역 · 예산을 알려주시면 입지 분석 방향과 준비 일정을 정리해 드립니다. 초기 상담은 무료입니다.</p>
        <div className="btns aos2">
          <Link href="/contact/"><span>입지 분석 상담 신청</span><i className="xi-long-arrow-right"></i></Link>
          <a className="line" href={`tel:${tel}`}><span><i className="xi-call"></i> {tel}</span></a>
        </div>
      </div>
    </section>
  );
}
