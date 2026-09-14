import Link from "next/link";
import { site } from "@/lib/site";
import { recentListings, allListings } from "@/lib/listings";
import { regionsOf, categoriesOf } from "@/lib/listing-utils";
import ListingCard from "@/components/listings/ListingCard";
import LocationSearch from "@/components/home/LocationSearch";
import { BrokerLine } from "@/components/listings/BrokerInfo";

/** 홈 매물 정보: 지역·업종 검색바 + 최신 매물 6건 (content/listings.json). 매물은 중개사무소 명의로 표시한다. */
export default function ListingsSection() {
  const lc = site.home.location;
  const all = allListings();
  const items = recentListings(6);
  return (
    <section className="main_con sec_pf" id="location">
      <div className="tt taC">
        <h4 className="en">{lc.en}</h4>
        <h3><span><b>{lc.title}</b></span></h3>
        <p>{lc.desc}</p>
      </div>
      <div className="wrap">
        <LocationSearch regions={regionsOf(all)} categories={categoriesOf(all)} />
        <div className="mr-cards aos2" id="home-listings">
          {items.map((l) => <ListingCard l={l} key={l.code} />)}
        </div>
        <p className="mr-notice"><BrokerLine /></p>
      </div>
      <Link className="link aos" href={lc.more}>
        <span>매물 전체 보기</span>
        <i className="xi-long-arrow-right"></i>
      </Link>
    </section>
  );
}
