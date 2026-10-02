import ServiceDetail from "@/components/service/ServiceDetail";
import type { Service } from "@/lib/site";
import { partnerPreparation } from "@/lib/partners";
import { partnerGuides } from "@/lib/partner-guides";

/**
 * 파트너 분야별 페이지 (/partners/<slug>/). 입지 분석 · 개원 지원 분야 페이지와 같은 ServiceDetail 구성에
 * 분야 가이드 표(lib/partner-guides)와 상담 준비 항목(lib/partners)을 FAQ 앞에 더한다.
 */
export default function PartnerDetail({ s }: { s: Service }) {
  // services.json 에 새 분야만 추가하고 가이드·준비 항목을 아직 쓰지 않았어도 빌드가 깨지지 않게 해당 섹션만 건너뛴다.
  const preparation = partnerPreparation[s.slug] ?? [];
  const guide = partnerGuides[s.slug];
  const page = { ...s, faq: [...(s.faq ?? []), ...(guide?.faq ?? [])] };
  return (
    <ServiceDetail s={page} keysTitle="결정 전에 확인할 항목">
      {guide ? <section className="sub_con sec_svc_guide">
        <div className="wrap">
          <div className="mr-sec-head aos">
            <em className="mr-pill">Field Guide</em>
            <h3>{guide.title}</h3>
            <p>{guide.intro}</p>
          </div>
          <div className="mr-guide aos2">
            <table>
              <caption>{s.title} 상담·비교 항목</caption>
              <thead><tr>{guide.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {guide.rows.map(([label, detail, question]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <td data-label={guide.columns[1]}>{detail}</td>
                    <td data-label={guide.columns[2]}>{question}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="note"><i className="xi-info-o"></i>{guide.note}</p>
          </div>
        </div>
      </section> : null}

      {preparation.length ? <section className="sub_con sec_svc_analysis sec_svc_prepare">
        <div className="wrap">
          <div className="mr-sec-head aos">
            <em className="mr-pill">Before We Talk</em>
            <h3>아래 내용을 알려주시면<br /><b>더 구체적으로</b> 안내합니다</h3>
            <p>아직 모두 정하지 않으셔도 괜찮습니다. 준비된 내용부터 이야기해 주세요.</p>
          </div>
          <ul className="mr-agrid col3 aos2">
            {preparation.map((p, i) => (
              <li key={p.title}>
                <div className="top"><i className="xi-check"></i><em>{String(i + 1).padStart(2, "0")}</em></div>
                <h5>{p.title}</h5>
                <p>{p.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section> : null}
    </ServiceDetail>
  );
}
