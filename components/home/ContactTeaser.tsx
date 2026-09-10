import Link from "next/link";
import { site } from "@/lib/site";

/** 홈 하단 상담 안내. 폼은 두지 않고 /contact 로 보낸다 (원본 sec_contact 배경·사진 구성 유지). */
export default function ContactTeaser() {
  const c = site.home.contact;
  const tel = site.contact.headerTel;
  return (
    <section className="main_con sec_contact" id="contact">
      <div className="wrap">
        <div className="pic aos"><img src={c.image} alt="" /></div>
        <div className="mr-teaser">
          <div className="tt wht">
            <div>
              <h3><span><b>{c.title}</b></span></h3>
              <h4>[ {c.en} ]</h4>
            </div>
            <p>{c.desc}<br />진료과·희망 지역·예산만 알려주시면 가능한 입지와 일정을 정리해 드립니다.</p>
          </div>
          <div className="act aos2">
            <em>초기 상담 무료 · 1영업일 내 회신</em>
            <a className="tel" href={`tel:${tel}`}><i className="xi-call"></i>{tel}</a>
            <div className="btns">
              <Link className="mr-btn" href="/contact"><span>온라인 상담 신청</span></Link>
              <Link className="mr-btn line" href="/location"><span>추천 개원지 보기</span></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
