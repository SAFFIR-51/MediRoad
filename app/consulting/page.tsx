import type { Metadata } from "next";
import Link from "next/link";
import SubTop from "@/components/layout/SubTop";
import { StepsGrid } from "@/components/home/StepsSection";
import Faq from "@/components/ui/Faq";
import CtaSection from "@/components/ui/CtaSection";
import { content, subtopFor } from "@/lib/site";

export const metadata: Metadata = { title: "개원컨설팅", description: "병·의원 개원, 약국, 양수양도, 폐업, 경영·마케팅까지 개원의 전 과정을 지원하는 메디로드 개원컨설팅" };

export default function ConsultingPage() {
  const c = content.consulting;
  const st = content.steps;
  const top = subtopFor("/consulting");
  return (
    <>
      <SubTop {...top} />
      <section className="sub_con sec_cintro">
        <div className="tt taC aos">
          <em>OUR SERVICE</em>
          <h4 dangerouslySetInnerHTML={{ __html: c.intro.title }} />
          <p dangerouslySetInnerHTML={{ __html: c.intro.desc }} />
        </div>
      </section>
      <section className="sub_con sec_fields">
        <div className="wrap">
          <div className="tt taC">
            <h3><span><b>컨설팅 분야</b></span></h3>
            <p>병·의원과 약국 개원의 전 과정을 다섯 개 영역으로 나누어 체계적으로 지원합니다.</p>
          </div>
          <div className="mr-fields">
            {c.fields.map((f) => (
              <div className="field aos" key={f.no}>
                <div className="pic"><img src={f.image} alt="" /><em>{f.no}</em></div>
                <div className="txt">
                  <span>{f.en}</span>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                  <ul>{f.points.map((p) => <li key={p}>{p}</li>)}</ul>
                  <Link className="mr-more" href={f.href}>자세히 보기 <i className="xi-long-arrow-right"></i></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="sub_con sec_process">
        <div className="wrap">
          <div className="tt taC">
            <em>PROCESS</em>
            <h3><span><b>{st.title}</b></span></h3>
            <p>{st.desc}</p>
          </div>
          <StepsGrid />
        </div>
      </section>
      <section className="sub_con sec_promise">
        <div className="wrap">
          <div className="tt taC">
            <em>PROMISE</em>
            <h4 dangerouslySetInnerHTML={{ __html: c.promises.title }} />
          </div>
          <div className="mr-promise aos">
            {c.promises.items.map((p, i) => (
              <div className="item" key={p.title}><em>0{i + 1}</em><h5>{p.title}</h5><p>{p.desc}</p></div>
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
          <Faq items={c.faq} />
        </div>
      </section>
      <CtaSection title="개원, 어디서부터 시작해야 할지 막막하신가요?" desc="진료과·희망 지역·예산만 알려주시면 가능한 입지와 일정을 정리해 드립니다. 초기 상담은 무료입니다.">
        <Link href="/contact"><span>상담 신청하기</span><i className="xi-long-arrow-right"></i></Link>
        <Link className="line" href="/consulting/roadmap"><span>개원 로드맵 보기</span><i className="xi-long-arrow-right"></i></Link>
      </CtaSection>
    </>
  );
}
