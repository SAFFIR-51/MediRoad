import type { Metadata } from "next";
import Link from "next/link";
import SubTop from "@/components/layout/SubTop";
import { content, subtopFor } from "@/lib/site";

export const metadata: Metadata = { title: "개원컨설팅", description: "병·의원 개원, 양수양도, 경영마케팅, 약국 개설까지 개원의 전 과정을 지원하는 메디로드 개원컨설팅" };

/** 컨설팅 소개 (간소화): 분야 목록 한 섹션. 절차는 분야별 페이지, 협력사는 홈에서 보여준다. */
export default function ConsultingPage() {
  const c = content.consulting;
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
              <span className="cnt"><b>{String(c.fields.length).padStart(2, "0")}</b> 개 영역</span>
            </div>
          </div>
          <div className="mr-fields">
            {c.fields.map((f) => (
              <div className="field aos" id={f.anchor} key={f.no}>
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
    </>
  );
}
