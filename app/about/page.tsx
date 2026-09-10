import type { Metadata } from "next";
import SubTop from "@/components/layout/SubTop";
import CeoBlock from "@/components/about/CeoBlock";
import PortfolioSection from "@/components/home/PortfolioSection";
import { Lines } from "@/components/ui/Text";
import PlaceMap from "@/components/ui/PlaceMap";
import { content, site, subtopFor, hasRealAddress } from "@/lib/site";

export const metadata: Metadata = { title: "회사소개", description: site.pages["/about"].desc };

const ICONS = ["/images/icons/mission.svg", "/images/icons/vision.svg", "/images/icons/action.svg"];

export default function AboutPage() {
  const a = content.about;
  const info = site.info;
  const real = hasRealAddress(info.address);
  return (
    <>
      <SubTop {...subtopFor("/about")} />
      <section className="sub_con sec01">
        <div className="tt taC aos">
          <em>SLOGAN</em>
          <h4><b dangerouslySetInnerHTML={{ __html: a.slogan.title }} /></h4>
          <p>{a.slogan.desc}</p>
        </div>
        <div className="wrap">
          <div className="pic aos2"><img src="/images/photo-about-building.jpg" alt="" /></div>
          <div className="mr-mva aos2">
            {a.cards.map((c, i) => (
              <div className="item" key={c.label}>
                <div className="head">
                  <h5><em>0{i + 1}</em>{c.label}<i>◆</i></h5>
                  <img src={ICONS[i]} alt="" className="icon" />
                </div>
                <h6><Lines lines={c.h} /></h6>
                <p><Lines lines={c.p} /></p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CeoBlock />
      <PortfolioSection sub />
      <section className="sub_con sec02" id="info">
        <div className="wrap">
          <div className="tt">
            <div className="line"><i></i></div>
            <h3><span>Information</span></h3>
            <p>찾아오시는 길과 연락처를 안내해 드립니다.</p>
          </div>
          <div className="pic">
            <img src="/images/collage-buildings.png" alt="" className="imgpc" />
            <img src="/images/collage-buildings-m.png" alt="" className="imgmo" />
          </div>
          <div className="box aos">
            <div className="mapw"><PlaceMap address={info.address} real={real} label={info.name} /></div>
            <div className="txt">
              <em>INFORMATION</em>
              <h5>{info.name}</h5>
              <p>{info.address}</p>
              <div className="contact">
                <dl><dt>Tel.</dt><dd>{info.tel}</dd></dl>
                <dl><dt>Fax.</dt><dd>{info.fax}</dd></dl>
                <dl><dt>E-mail</dt><dd>{info.email}</dd></dl>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
