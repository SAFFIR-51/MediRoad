import Link from "next/link";
import { site } from "@/lib/site";
import { recentListings } from "@/lib/listings";
import ListingCard from "@/components/listings/ListingCard";

/** 홈 추천 개원지: 최신 매물 6건 (content/listings.json) */
export default function ListingsSection() {
  const lc = site.home.location;
  const items = recentListings(6);
  return (
    <section className="main_con sec_pf" id="location">
      <div className="tt taC">
        <h4>[ {lc.en} ]</h4>
        <h3><span><b>{lc.title}</b></span></h3>
        <p>{lc.desc}</p>
      </div>
      <div className="wrap">
        <div className="mr-cards aos" id="home-listings">
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
