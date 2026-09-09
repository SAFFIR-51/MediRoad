import type { Metadata } from "next";
import Link from "next/link";
import SubTop from "@/components/layout/SubTop";
import CtaSection from "@/components/ui/CtaSection";
import ListingBrowser from "@/components/listings/ListingBrowser";
import { content } from "@/lib/site";
import { allListings, listingGate } from "@/lib/listings";
import { currentMember } from "@/lib/auth";

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
  const [items, gate, member] = await Promise.all([allListings(), listingGate(), currentMember()]);
  const gateAll = gate === "all" && !member;
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
          {gateAll ? (
            <div className="mr-gate">
              <i className="xi-lock"></i>
              <h4>회원 전용 매물 정보입니다</h4>
              <p>임대·분양 매물과 병원 매매 정보는 로그인 후 열람하실 수 있습니다. 가입은 무료입니다.</p>
              <div className="btns"><Link className="mr-btn" href="/member/login?next=%2Flocation">로그인</Link><Link className="mr-btn line" href="/member/join">회원가입</Link></div>
            </div>
          ) : (
            <>
              <ListingBrowser items={items} initialType={type} />
              {hasSample && <p className="mr-notice">※ &quot;예시&quot; 표시 매물은 데모 데이터입니다. 관리자 페이지에서 실제 매물을 등록하면 자동으로 교체됩니다.</p>}
              {!member && gate === "detail" && <p className="mr-notice">매물 상세 정보(주소·조건·사진)는 회원 로그인 후 열람하실 수 있습니다.</p>}
            </>
          )}
        </div>
      </section>
      <CtaSection title="찾으시는 조건의 매물이 없나요?" desc="희망 지역·진료과·평수·예산을 알려주시면 비공개 매물을 포함해 맞춤 제안을 드립니다.">
        <Link href="/contact"><span>상담 신청하기</span><i className="xi-long-arrow-right"></i></Link>
        <Link className="line" href="/consulting"><span>개원컨설팅 보기</span><i className="xi-long-arrow-right"></i></Link>
      </CtaSection>
    </>
  );
}
