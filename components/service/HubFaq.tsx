import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { faqPageLd, type Faq } from "@/lib/aeo";

/** 허브 페이지 하단 FAQ. 분야별 페이지(ServiceDetail)와 같은 마크업에 FAQPage 구조화 데이터를 함께 출력한다. */
export default function HubFaq({ items, title = "자주 묻는 질문" }: { items: Faq[]; title?: string }) {
  if (!items.length) return null;
  return (
    <section className="sub_con sec_faq">
      <JsonLd data={faqPageLd(items)} />
      <div className="wrap">
        <div className="mr-faq">
          <div className="head aos"><em className="mr-pill">FAQ</em><h3>{title}</h3><Link className="more" href="/faq/">전체 질문 보기 <i className="xi-long-arrow-right"></i></Link></div>
          <div className="list aos2">
            {items.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary><em>Q</em><span>{f.q}</span><i className="xi-angle-down-min"></i></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
