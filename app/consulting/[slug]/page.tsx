import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SubTop from "@/components/layout/SubTop";
import Faq from "@/components/ui/Faq";
import KeyCards from "@/components/consulting/KeyCards";
import RoadmapSections from "@/components/consulting/RoadmapSections";
import { services } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  return s ? { title: s.title, description: s.desc } : { title: "컨설팅" };
}

/**
 * 컨설팅 분야별 페이지.
 * 서브비주얼 → 소개(배지·헤드라인·큰 사진) → 필요성과 가치 → 진행 절차
 * → 핵심 제공 서비스(어두운 배경 카드 캐러셀) → 약속(사진 배경 인용문 + CONTACT) → (개원만) 개원 로드맵 → FAQ
 * 참고 사이트는 "가치 → 서비스 → 절차" 순이라, 절차를 먼저 보여 흐름을 다르게 가져간다.
 */
export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();
  const others = services.filter((x) => x.slug !== s.slug);
  return (
    <>
      <SubTop en={s.en} title={s.title} desc={s.desc} />

      <section className="sub_con sec_svc_hero">
        <div className="wrap">
          <em className="mr-pill aos">{s.en}</em>
          <h4 className="mr-svc-head aos">
            <span>{s.headline.light}</span>
            <b dangerouslySetInnerHTML={{ __html: s.headline.bold }} />
          </h4>
          <div className="mr-svc-intro aos2">
            <div className="mr-svc-photo"><img src={s.image} alt={s.title} /></div>
            <div className="mr-svc-value">
              <div className="lb">
                <i className={s.icon}></i>
                <div><em>Significance &amp; Value</em><h5>필요성과 가치</h5></div>
              </div>
              <p dangerouslySetInnerHTML={{ __html: s.value }} />
            </div>
          </div>
        </div>
      </section>

      <section className="sub_con sec_process">
        <div className="wrap">
          <div className="tt taC">
            <em>PROCESS</em>
            <h3><span><b>진행 절차</b></span></h3>
          </div>
          <div className="mr-svc-steps aos">
            {s.process.map((st) => (
              <div className="step" key={st.no}>
                <div className="top"><i className={st.icon}></i><em>{st.no}</em></div>
                <h5>{st.title}</h5>
                <p>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sub_con sec_svc_keys">
        <div className="wrap">
          <div className="mr-keys-head">
            <div className="l aos"><em className="mr-pill">Our Key Deliverables</em><h3>핵심 제공 서비스</h3></div>
            <p className="aos2" dangerouslySetInnerHTML={{ __html: s.keysDesc }} />
          </div>
          <KeyCards items={s.points} />
        </div>
      </section>

      <section className="sub_con sec_svc_promise" style={{ backgroundImage: `url(${s.promiseImage})` }}>
        <div className="wrap">
          <div className="in aos">
            <h3>MediRoad&apos;s Promise</h3>
            <em>[ 메디로드가 약속드립니다 ]</em>
            <span className="bar"></span>
            <p>&ldquo; {s.promise} &rdquo;</p>
            <Link className="mr-btn" href="/contact"><span>Contact us</span></Link>
          </div>
        </div>
      </section>

      {s.slug === "opening" && <RoadmapSections />}

      <section className="sub_con sec_faq">
        <div className="wrap">
          <div className="tt taC">
            <em>FAQ</em>
            <h3><span><b>자주 묻는 질문</b></span></h3>
          </div>
          <Faq items={s.faq} />
          <div className="mr-svc-others aos">
            <h5>다른 컨설팅 분야</h5>
            <div className="list">
              {others.map((o) => <Link key={o.slug} href={`/consulting/${o.slug}`}>{o.title}<i className="xi-long-arrow-right"></i></Link>)}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
