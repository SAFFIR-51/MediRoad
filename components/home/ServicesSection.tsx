import Link from "next/link";
import { site } from "@/lib/site";
import { Lines } from "@/components/ui/Text";

/** 홈 개원컨설팅 4분야 (원본 sec_service 2x2 이미지 카드) → 분야별 페이지로 이동 */
export default function ServicesSection() {
  const s = site.home.services;
  return (
    <section className="main_con sec_service" id="consulting">
      <div className="tt taC">
        <h3><span><b>{s.title}</b></span></h3>
        <h4>[ {s.en} ]</h4>
        <p>{s.desc}</p>
      </div>
      <div className="con aos">
        {s.items.map((it, i) => (
          <div className={`item item0${i + 1}`} key={it.title}>
            <Link href={it.href}>
              <div className="bg"></div>
              <div className="txt">
                <em>[ {it.en} ]</em>
                <h4>{it.title}</h4>
                <p><Lines lines={it.desc} /></p>
                <i className="xi-search"></i>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
