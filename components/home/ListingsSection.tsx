import Link from "next/link";
import { site } from "@/lib/site";
import { recentListings, allListings } from "@/lib/listings";
import { regionsOf, categoriesOf } from "@/lib/listing-utils";
import ListingCard from "@/components/listings/ListingCard";
import LocationSearch from "@/components/home/LocationSearch";

/** 홈 추천 개원지: 지역·업종 검색바 + 최신 매물 6건 (content/listings.json) */
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
      </div>
      <Link className="link aos" href={lc.more}>
        <span>매물 전체 보기</span>
        <i className="xi-long-arrow-right"></i>
      </Link>
    </section>
  );
}
