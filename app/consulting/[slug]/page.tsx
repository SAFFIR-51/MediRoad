import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SubTop from "@/components/layout/SubTop";
import KeyCards from "@/components/consulting/KeyCards";
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
 * 컨설팅 분야별 페이지 (간소화): 소개(헤드라인·사진·필요성과 가치) → 진행 절차 → 핵심 제공 서비스.
 * 개원 로드맵은 진행 절차에 합쳤고 FAQ 는 두지 않는다. process·points 가 비어 있으면 해당 섹션을 건너뛴다 (약국은 소개만).
 * 페이지 끝의 상담 CTA 는 레이아웃 공통 CtaBand 가 붙인다.
 */
export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();
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

      {s.process.length > 0 && (
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
      )}

      {s.points.length > 0 && (
        <section className="sub_con sec_svc_keys">
          <div className="wrap">
            <div className="mr-keys-head">
              <div className="l aos"><em className="mr-pill">Our Key Deliverables</em><h3>핵심 제공 서비스</h3></div>
              <p className="aos2" dangerouslySetInnerHTML={{ __html: s.keysDesc }} />
            </div>
            <KeyCards items={s.points} />
          </div>
        </section>
      )}
    </>
  );
}
