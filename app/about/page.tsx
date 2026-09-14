import type { Metadata } from "next";
import SubTop from "@/components/layout/SubTop";
import { Lines } from "@/components/ui/Text";
import { content, site, subtopFor } from "@/lib/site";

export const metadata: Metadata = { title: "회사소개", description: site.pages["/about"].desc };

const ICONS = ["/images/icons/mission.svg", "/images/icons/vision.svg", "/images/icons/action.svg"];

/**
 * 회사소개 (간소화): 슬로건 + MISSION/VISION/ACTION 을 한 섹션(좌측 스테이트먼트 · 우측 항목)으로 묶는다.
 * 개원 실적은 홈에서 보여준다. 대표 인사말은 /about/greeting, 오시는 길은 /about/location 에 둔다.
 */
export default function AboutPage() {
  const a = content.about;
  return (
    <>
      <SubTop {...subtopFor("/about")} />
      <section className="sub_con sec_about">
        <div className="wrap">
          <div className="mr-about">
            <div className="lead aos">
              <em>SLOGAN</em>
              <h3 dangerouslySetInnerHTML={{ __html: a.slogan.title }} />
              <p>{a.slogan.desc}</p>
              <figure className="shot">
                <img src="/images/photo-about-building.jpg" alt="" />
                <figcaption>서울 · 경기 개원입지 컨설팅</figcaption>
              </figure>
            </div>
            <div className="mva aos2">
              {a.cards.map((c, i) => (
                <div className="item" key={c.label}>
                  <div className="head">
                    <em>0{i + 1}</em>
                    <span>{c.label}</span>
                    <img src={ICONS[i]} alt="" />
                  </div>
                  <h5><Lines lines={c.h} /></h5>
                  <p><Lines lines={c.p} /></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
