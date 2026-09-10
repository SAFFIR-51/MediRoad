import Link from "next/link";
import { fmtDate, listingUrl, priceLabel, typeLabel, type Listing } from "@/lib/listing-utils";

export function Badges({ l }: { l: Listing }) {
  return (
    <>
      <span className={`mr-badge ${l.type}`}>{typeLabel(l.type)}</span>
      <span className="mr-badge cat">{l.category}</span>
      {l.status === "closed" ? <span className="mr-badge" style={{ background: "#777" }}>거래완료</span> : null}
    </>
  );
}

export default function ListingCard({ l }: { l: Listing }) {
  const { label, value } = priceLabel(l.deposit);
  const img = l.images[0] || "/brand/og.png";
  const region1 = (l.region || "").trim().split(" ")[0] || "";
  return (
    <Link className="mr-card" href={listingUrl(l.code)} data-type={l.type} data-cat={l.category} data-region={region1}>
      <div className="pic"><img src={img} alt={l.title} loading="lazy" /><div className="badges"><Badges l={l} /></div></div>
      <div className="body">
        <div className="region"><span>{l.region}</span><span>{fmtDate(l.dateListed)}</span></div>
        <h5>{l.title}</h5>
        <div className="spec"><span>{l.area}</span><span>{l.floor}</span></div>
        <dl className="price">
          <div><dt>{label}</dt><dd>{value}</dd></div>
          {l.rent && l.rent !== "-" ? <div><dt>{l.type === "sale" ? "임대료" : "월임대료"}</dt><dd>{l.rent}</dd></div> : null}
        </dl>
        <span className="more"><i className="xi-long-arrow-right"></i></span>
      </div>
    </Link>
  );
}
