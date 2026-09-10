import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import SubTop from "@/components/layout/SubTop";
import ContactForm from "@/components/contact/ContactForm";
import PhotoStrip from "@/components/ui/PhotoStrip";
import Faq from "@/components/ui/Faq";
import { content, site, subtopFor } from "@/lib/site";

export const metadata: Metadata = { title: "상담신청", description: "메디로드 개원 상담 신청. 진료과·희망 지역·예산을 알려주시면 가능한 입지와 일정을 정리해 드립니다." };

const POINTS = ["초기 상담은 무료입니다", "접수 후 1영업일 내 담당자가 연락드립니다", "비공개 매물을 포함해 맞춤 제안을 드립니다", "입력하신 정보는 상담 목적으로만 사용합니다"];

export default function ContactPage() {
  const top = subtopFor("/contact");
  const info = site.info;
  return (
    <>
      <SubTop {...top} />
      <section className="sub_con sec_contact_page">
        <div className="wrap">
          <div className="mr-contact">
            <aside className="side aos">
              <em className="badge">CONTACT US</em>
              <h4>개원 상담,<br /><b>지금 신청하세요</b></h4>
              <p>진료과·희망 지역·예산만 알려주시면 가능한 입지와 일정을 정리해 드립니다. 아직 계획이 구체적이지 않아도 괜찮습니다.</p>
              <ul className="points">
                {POINTS.map((p) => <li key={p}><i className="xi-check"></i>{p}</li>)}
              </ul>
              <dl className="info">
                <div><dt><i className="xi-call"></i>전화</dt><dd className="tel"><a href={`tel:${info.tel}`}>{info.tel}</a></dd></div>
                <div><dt><i className="xi-mail-o"></i>이메일</dt><dd><a href={`mailto:${info.email}`}>{info.email}</a></dd></div>
                <div><dt><i className="xi-map-marker"></i>주소</dt><dd>{info.address}</dd></div>
              </dl>
              <div className="btns">
                <a className="mr-btn line" href={`tel:${info.tel}`}><i className="xi-call"></i>전화 상담</a>
                <Link className="mr-btn line" href="/about/location"><i className="xi-map-marker"></i>오시는 길</Link>
              </div>
            </aside>
            <div className="form aos2">
              <Suspense fallback={null}><ContactForm /></Suspense>
            </div>
          </div>
        </div>
      </section>
      <PhotoStrip en="PROCESS" title="상담은 이렇게 진행됩니다" desc="접수부터 입지 투어까지, 세 단계로 빠르게 답을 드립니다." items={content.contactSteps} />
      <section className="sub_con sec_faq no-top">
        <div className="wrap">
          <div className="tt taC">
            <em>FAQ</em>
            <h3><span><b>자주 묻는 질문</b></span></h3>
          </div>
          <Faq items={content.consulting.faq} />
        </div>
      </section>
    </>
  );
}
