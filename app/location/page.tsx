import type { Metadata } from "next";
import SubTop from "@/components/layout/SubTop";
import ListingBrowser from "@/components/listings/ListingBrowser";
import { content } from "@/lib/site";
import { allListings } from "@/lib/listings";

const TITLES: Record<string, { en: string; title: string; desc: string }> = {
  all: { en: "Location", title: "개원입지", desc: "자사 네트워크로 선별한 임대·분양 매물과 병원 매매 정보를 제공합니다" },
  lease: { en: "Lease & Sale", title: "임대분양정보", desc: "병·의원 개원에 적합한 임대 및 분양 매물을 안내합니다" },
  sale: { en: "Hospital M&A", title: "병원매매정보", desc: "양수·양도가 가능한 병·의원 매물을 안내합니다" },
};

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ type?: string }> }): Promise<Metadata> {
  const { type } = await searchParams;
  const t = TITLES[type === "lease" || type === "sale" ? type : "all"];
  return { title: t.title, description: t.desc };
}

export default async function LocationPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type: q } = await searchParams;
  const type = q === "lease" || q === "sale" ? q : "all";
  const t = TITLES[type];
  const lc = content.location;
  const items = allListings();
  const hasSample = items.some((l) => l.isSample);

  return (
    <>
      <SubTop en={t.en} title={t.title} desc={t.desc} />
      <section className="sub_con sec_loc">
        <div className="wrap">
          <div className="tt taC aos">
            <em>LOCATION</em>
            <h4 dangerouslySetInnerHTML={{ __html: lc.intro.title }} />
            <p dangerouslySetInnerHTML={{ __html: lc.intro.desc }} />
          </div>
          <div className="mr-points aos2">
            {lc.points.map((p, i) => <div className="item" key={p.title}><em>POINT 0{i + 1}</em><h5>{p.title}</h5><p>{p.desc}</p></div>)}
          </div>
        </div>
      </section>
      <section className="sub_con sec_list" id="list">
        <div className="wrap">
          <ListingBrowser items={items} initialType={type} />
          {hasSample && <p className="mr-notice">※ &quot;예시&quot; 표시 매물은 데모 데이터입니다. 실제 매물은 서버 연동 후 교체됩니다.</p>}
          <p className="mr-notice">정확한 주소·임대 조건·매출 자료 등 상세 정보는 상담 신청 시 담당자가 개별 안내해 드립니다.</p>
        </div>
      </section>
    </>
  );
}
