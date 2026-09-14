import type { Metadata } from "next";
import Link from "next/link";
import SubTop from "@/components/layout/SubTop";
import ListingBrowser from "@/components/listings/ListingBrowser";
import { BrokerLine } from "@/components/listings/BrokerInfo";
import { site } from "@/lib/site";
import { allListings } from "@/lib/listings";

const b = site.broker;
const TITLES: Record<string, { en: string; title: string; desc: string }> = {
  all: { en: "Location", title: "개원입지", desc: `${b.name}가 의뢰받아 게시하는 병·의원 매물 정보입니다` },
  lease: { en: "Lease & Sale", title: "임대분양정보", desc: `${b.name}가 의뢰받아 게시하는 임대·분양 매물입니다` },
  sale: { en: "Hospital M&A", title: "병원매매정보", desc: `${b.name}가 의뢰받아 게시하는 병원 매매 매물입니다` },
};

type Query = { type?: string; region?: string; cat?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<Query> }): Promise<Metadata> {
  const { type } = await searchParams;
  const t = TITLES[type === "lease" || type === "sale" ? type : "all"];
  return { title: t.title, description: t.desc };
}

/**
 * 입지 목록 (간소화): 매물 목록 한 섹션 + 중개사무소 표기 + 개원 상담 CTA(상담 신청 · 전화).
 * 어두운 배경이라 공통 CtaBand 는 이 페이지에서 끄고 목록 바로 아래에 둔다. 매물 안내 문구는 상단 비주얼 desc 에 둔다.
 */
export default async function LocationPage({ searchParams }: { searchParams: Promise<Query> }) {
  const { type: q, region, cat } = await searchParams;
  const type = q === "lease" || q === "sale" ? q : "all";
  const t = TITLES[type];
  const items = allListings();

  return (
    <>
      <SubTop en={t.en} title={t.title} desc={t.desc} />
      <div className="mr-loc-dark">
        <section className="sub_con sec_list" id="list">
          <div className="wrap">
            <ListingBrowser items={items} initialType={type} initialRegion={region ?? ""} initialCat={cat ?? ""} />
            <p className="mr-notice"><BrokerLine /></p>
            <div className="mr-loc-cta">
              <div>
                <em>CONTACT US</em>
                <h4>원하는 입지가 보이지 않나요?</h4>
                <p>진료과 · 희망 지역 · 예산을 알려주시면 개원 가능한 입지와 일정을 정리해 드립니다. 초기 상담은 무료입니다.</p>
              </div>
              <div className="btns">
                <Link href="/contact"><span>상담 신청하러 가기</span><i className="xi-long-arrow-right"></i></Link>
                <a className="line" href={`tel:${site.contact.headerTel}`}><span>전화 상담 {site.contact.headerTel}</span><i className="xi-call"></i></a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
