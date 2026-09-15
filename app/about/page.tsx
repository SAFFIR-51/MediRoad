import SubTop from "@/components/layout/SubTop";
import { Lines } from "@/components/ui/Text";
import { content, subtopFor } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/about", { title: "회사소개" });

const ICONS = ["/images/icons/mission.svg", "/images/icons/vision.svg", "/images/icons/action.svg"];

/**
 * 회사소개: 슬로건 + MISSION/VISION/ACTION 을 한 섹션(좌측 스테이트먼트 · 우측 항목)으로 묶는다.
 * 개원 실적은 홈에서 보여준다. 대표 인사말은 /about/greeting/, 오시는 길은 /about/location/ 에 둔다.
 */
export default function AboutPage() {
  const a = content.about;
  const top = subtopFor("/about");
  return (
    <>
      <SubTop {...top} visual={top.visual || "catchment"} bg="about" />
      <section className="sub_con sec_about">
        <div className="wrap">
          <div className="mr-about">
            <div className="lead aos">
              <em>SLOGAN</em>
              <h3 dangerouslySetInnerHTML={{ __html: a.slogan.title }} />
              <p>{a.slogan.desc}</p>
              <figure className="shot">
                <img src="/images/about-building.jpg" alt="" />
                <figcaption>서울 · 경기 병·의원 개원 입지 분석</figcaption>
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
