import Link from "next/link";
import { areaLabel, fmtDate, floorLabel, listingUrl, priceMain, STATUS_LABEL, type Listing } from "@/lib/listing-utils";
import { site } from "@/lib/site";

export function Badges({ l }: { l: Pick<Listing, "dealType" | "category" | "status"> }) {
  return (
    <>
      <span className={`mr-badge ${l.dealType === "매매" ? "sale" : "lease"}`}>{l.dealType}</span>
      <span className="mr-badge cat">{l.category}</span>
      {l.status !== "open" ? <span className="mr-badge off">{STATUS_LABEL[l.status]}</span> : null}
    </>
  );
}

export default function ListingCard({ l }: { l: Listing }) {
  const { label, value } = priceMain(l);
  const img = l.images[0] || "/brand/og.png";
  return (
    <Link className="mr-card" href={listingUrl(l.code)}>
      <div className="pic"><img src={img} alt={l.title} loading="lazy" /><div className="badges"><Badges l={l} /></div></div>
      <div className="body">
        <div className="region"><span>{l.region}</span><span>{fmtDate(l.createdAt)}</span></div>
        <h5>{l.title}</h5>
        <div className="spec"><span>{areaLabel(l.areaM2)}</span><span>{floorLabel(l.floorCurrent, l.floorTotal)}</span></div>
        <dl className="price">
          <div><dt>{label}</dt><dd>{value}</dd></div>
        </dl>
        <p className="broker">중개 · {site.broker.name}</p>
        <span className="more"><i className="xi-long-arrow-right"></i></span>
      </div>
    </Link>
  );
}
