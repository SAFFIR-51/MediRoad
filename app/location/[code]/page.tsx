import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SubTop from "@/components/layout/SubTop";
import ListingCard, { Badges } from "@/components/listings/ListingCard";
import Gallery from "@/components/listings/Gallery";
import ConsultLink from "@/components/listings/ConsultLink";
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

export default async function ListingDetailPage({ params }: Props) {
  const { code } = await params;
  const l = findListing(decodeURIComponent(code));
  if (!l) notFound();
  const tLabel = typeLabel(l.type);
  const others = relatedListings(l, 3);
  const { label, value } = priceLabel(l.deposit);
  const rows: [string, React.ReactNode][] = [
    ["매물번호", l.code],
    ["구분", `${tLabel} · ${l.category}`],
    ["지역", l.region],
    ["소재지", <>{l.address} <small style={{ color: "#999" }}>(상담 후 상세 안내)</small></>],
    ["면적", l.area],
    ["층수", l.floor],
    [label, value],
    ...(l.rent && l.rent !== "-" ? [[l.type === "sale" ? "임대료" : "월임대료", l.rent] as [string, React.ReactNode]] : []),
    ["등록일", fmtDate(l.dateListed)],
  ];

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
                <div className="note">정확한 주소, 임대 조건, 매출 자료 등 상세 정보는 상담 신청 후 담당자가 개별 안내해 드립니다. 현장 투어를 원하시면 상담 시 말씀해 주세요.</div>
              </div>
            </div>
            <aside className="mr-summary aos2">
              <div className="badges"><Badges l={l} /></div>
              <h3>{l.title}</h3>
              <div className="region">{l.region}</div>
              <table><tbody>{rows.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody></table>
              <div className="tags">{l.features.map((f) => <span key={f}>{f}</span>)}</div>
              <ConsultLink code={l.code} note={`[${l.code}] ${l.title} (${l.region}) 문의`} />
              <span className="tel">전화 문의 <b>{site.contact.headerTel}</b></span>
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
