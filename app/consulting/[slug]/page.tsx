import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SubTop from "@/components/layout/SubTop";
import Faq from "@/components/ui/Faq";
import { services } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  return s ? { title: s.title, description: s.desc } : { title: "개원컨설팅" };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();
  const others = services.filter((x) => x.slug !== s.slug);
  return (
    <>
      <SubTop en={s.en} title={s.title} desc={s.desc} />
      <section className="sub_con sec_svc_intro">
        <div className="wrap">
          <div className="mr-svc-intro">
            <div className="pic aos"><img src={s.image} alt="" /></div>
            <div className="txt aos2">
              <em>[ {s.en} ]</em>
              <h4 dangerouslySetInnerHTML={{ __html: s.intro.title }} />
              <p>{s.intro.desc}</p>
              <Link className="mr-btn" href="/contact"><span>상담 신청하기</span></Link>
            </div>
          </div>
        </div>
      </section>
      <section className="sub_con sec_svc_points">
        <div className="wrap">
          <div className="tt taC">
            <em>SERVICE</em>
            <h3><span><b>무엇을 도와드리나요</b></span></h3>
          </div>
          <div className="mr-svc-points aos">
            {s.points.map((p, i) => (
              <div className="item" key={p.title}><em>0{i + 1}</em><h5>{p.title}</h5><p>{p.desc}</p></div>
            ))}
          </div>
        </div>
      </section>
      <section className="sub_con sec_process">
        <div className="wrap">
          <div className="tt taC">
            <em>PROCESS</em>
            <h3><span><b>진행 절차</b></span></h3>
          </div>
          <div className="mr-steps aos">
            {s.process.map((st) => (
              <div className="step" key={st.no}><em>{st.no}</em><h5>{st.title}</h5><ul><li>{st.desc}</li></ul></div>
            ))}
          </div>
        </div>
      </section>
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
              <Link href="/consulting/roadmap">개원 로드맵<i className="xi-long-arrow-right"></i></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
