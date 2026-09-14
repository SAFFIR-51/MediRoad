import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SubTop from "@/components/layout/SubTop";
import ListingCard, { Badges } from "@/components/listings/ListingCard";
import Gallery from "@/components/listings/Gallery";
import BrokerInfo from "@/components/listings/BrokerInfo";
import { allListings, findListing, relatedListings, fmtDate, typeLabel, priceLabel } from "@/lib/listings";
import { site } from "@/lib/site";

type Props = { params: Promise<{ code: string }> };

export function generateStaticParams() {
  return allListings().map((l) => ({ code: l.code }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const l = findListing(decodeURIComponent(code));
  return l ? { title: l.title, description: `${typeLabel(l.type)} · ${l.category} · ${l.region}` } : { title: "매물" };
}

/**
 * 매물 상세. 표에는 인터넷 표시·광고 명시사항(소재지·면적·가격·용도·거래형태·층수·사용승인일·방향·주차·관리비·입주가능일, 위반건축물)을 보여주고,
 * 광고·중개 주체인 중개사무소 정보를 함께 표시한다. 매물 문의는 메디로드 상담 폼이 아니라 중개사무소로 연결한다.
 */
export default async function ListingDetailPage({ params }: Props) {
  const { code } = await params;
  const l = findListing(decodeURIComponent(code));
  if (!l) notFound();
  const tLabel = typeLabel(l.type);
  const others = relatedListings(l, 3);
  const { label, value } = priceLabel(l.deposit);
  const b = site.broker;
  const rows: [string, React.ReactNode][] = [
    ["매물번호", l.code],
    ["거래형태", `${tLabel} · ${l.category}`],
    ["소재지", l.address],
    ["건축물 용도", l.use],
    ...(l.violation ? [["위반건축물", <b key="v" style={{ color: "#c0392b" }}>위반건축물 (건축물대장 기재)</b>] as [string, React.ReactNode]] : []),
    ["면적", l.area],
    ["층수", l.floor],
    [label, value],
    ...(l.rent && l.rent !== "-" ? [[l.type === "sale" ? "임대료" : "월임대료", l.rent] as [string, React.ReactNode]] : []),
    ["관리비", l.maintenance],
    ["방향", l.direction],
    ["주차대수", l.parking],
    ["사용승인일", l.approvalDate],
    ["입주가능일", l.moveIn],
    ["등록일", fmtDate(l.dateListed)],
  ].filter(([, v]) => v !== "" && v != null) as [string, React.ReactNode][];

  return (
    <>
      <SubTop en={tLabel} title={l.title} desc={l.region} compact />
      <section className="sub_con sec_detail">
        <div className="wrap">
          <Link className="mr-back" href={`/location?type=${l.type}`}><i className="xi-long-arrow-left"></i> {tLabel} 목록으로</Link>
          <div className="mr-detail">
            <div>
              <Gallery images={l.images} title={l.title} />
              <div className="mr-desc aos2">
                <h4>매물 소개</h4>
                <p>{l.description}</p>
                <div className="note">이 매물 정보는 {b.name}가 의뢰받아 게시한 정보입니다. 매물 문의·현장 안내·계약은 중개사무소에서 진행하며, {site.company.name}은 부동산 중개를 하지 않습니다.</div>
              </div>
            </div>
            <aside className="mr-summary aos2">
              <div className="badges"><Badges l={l} /></div>
              <h3>{l.title}</h3>
              <div className="region">{l.region}</div>
              <table><tbody>{rows.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody></table>
              <div className="tags">{l.features.map((f) => <span key={f}>{f}</span>)}</div>
              <a className="btn" href={`tel:${b.tel}`}><span>중개사무소 전화 문의</span><i className="xi-call"></i></a>
              <BrokerInfo />
            </aside>
          </div>
          {others.length > 0 && (
            <div className="mr-related">
              <h4>함께 볼 만한 매물</h4>
              <div className="mr-cards">{others.map((o) => <ListingCard l={o} key={o.code} />)}</div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
