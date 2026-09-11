import Link from "next/link";
import { site } from "@/lib/site";

/** 홈 하단 상담 CTA. 사진 배경 위에 문구·버튼만 올리는 전형적인 CTA 섹션 (폼은 /contact). */
export default function ContactTeaser() {
  const c = site.home.contact;
  const tel = site.contact.headerTel;
  return (
    <section className="main_con mr-cta mr-cta-home" id="contact" style={{ backgroundImage: `url(${c.image})` }}>
      <div className="wrap">
        <em className="aos">{c.en}</em>
        <h4 className="aos">{c.headline}</h4>
        <p className="aos2">{c.desc}<br />아직 계획이 구체적이지 않아도 괜찮습니다.</p>
        <span className="note aos2"><i className="xi-check"></i>초기 상담 무료<b>·</b>1영업일 내 회신</span>
        <div className="btns aos2">
          <Link href="/contact"><span>온라인 상담 신청</span><i className="xi-long-arrow-right"></i></Link>
          <a className="line" href={`tel:${tel}`}><span><i className="xi-call"></i> {tel}</span></a>
        </div>
      </div>
    </section>
  );
}
