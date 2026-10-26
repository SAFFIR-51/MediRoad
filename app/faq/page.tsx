import Link from "next/link";
import SubTop from "@/components/layout/SubTop";
import JsonLd from "@/components/seo/JsonLd";
import { faqSections, faqPageLd, breadcrumbLd } from "@/lib/aeo";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/faq", { title: "자주 묻는 질문" });

/**
 * 통합 FAQ: 이용 안내(content/faq.json) + 입지 분석 · 개원 지원 · 파트너 분야별 문항(services.json · partner-guides)을 한 페이지에 모은다.
 * AI 답변엔진이 "개원 입지·인허가·의료광고" 질문의 근거로 인용하기 좋도록 질문과 답이 모두 정적 HTML 에 들어간다.
 * 문항은 원래 페이지에서 고치면 여기에도 반영된다.
 */
export default function FaqPage() {
  const sections = faqSections();
  const all = sections.flatMap((s) => s.items);
  return (
    <>
      <JsonLd data={[faqPageLd(all), breadcrumbLd([["자주 묻는 질문", "/faq/"]])]} />
      <SubTop en="FAQ" title="자주 묻는 질문" desc={`병·의원 개원 입지 분석부터 인허가, 의료광고, 개원 준비까지 메디로드가 자주 받는 질문 ${all.length}개를 모았습니다.`} bg="support" />
      <section className="sub_con sec_faq sec_faq_hub">
        <div className="wrap">
          <nav className="mr-faq-toc aos" aria-label="분야">
            {sections.map((s) => <a key={s.id} href={`#${s.id}`}>{s.title}<em>{s.items.length}</em></a>)}
          </nav>
          {sections.map((s) => (
            <div className="mr-faq" id={s.id} key={s.id}>
              <div className="head aos">
                <em className="mr-pill">FAQ</em>
                <h3>{s.title}</h3>
                {s.href ? <Link className="more" href={s.href}>{s.title} 보기 <i className="xi-long-arrow-right"></i></Link> : null}
              </div>
              <div className="list aos2">
                {s.items.map((f, i) => (
                  <details key={i}>
                    <summary><em>Q</em><span dangerouslySetInnerHTML={{ __html: f.q }} /><i className="xi-angle-down-min"></i></summary>
                    <p>
                      <span dangerouslySetInnerHTML={{ __html: f.a }} />
                      {f.from ? <Link className="from" href={f.from.href}>{f.from.title} 자세히 보기</Link> : null}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
