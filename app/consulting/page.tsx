import type { Metadata } from "next";
import Link from "next/link";
import SubTop from "@/components/layout/SubTop";
import { StepsTimeline } from "@/components/home/StepsSection";
import Faq from "@/components/ui/Faq";
import { content, subtopFor } from "@/lib/site";

export const metadata: Metadata = { title: "개원컨설팅", description: "병·의원 개원, 약국, 양수양도, 폐업, 경영·마케팅까지 개원의 전 과정을 지원하는 메디로드 개원컨설팅" };

export default function ConsultingPage() {
  const c = content.consulting;
  const st = content.steps;
  const top = subtopFor("/consulting");
  return (
    <>
      <SubTop {...top} />
      <section className="sub_con sec_fields">
        <div className="wrap">
          <div className="mr-fields-head">
            <div className="l aos">
              <em>OUR SERVICE</em>
              <h4 dangerouslySetInnerHTML={{ __html: c.intro.title }} />
            </div>
            <div className="r aos2">
              <p dangerouslySetInnerHTML={{ __html: c.intro.desc }} />
              <span className="cnt"><b>05</b> 개 영역</span>
            </div>
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
          <StepsTimeline />
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
    </>
  );
}
