import Link from "next/link";
import SubTop from "@/components/layout/SubTop";
import KeyCards from "@/components/consulting/KeyCards";
import AnalysisBoard from "@/components/analysis/AnalysisBoard";
import JsonLd from "@/components/seo/JsonLd";
import { GROUPS, servicesIn, serviceHref, site, type Service } from "@/lib/site";
import { siteUrl } from "@/lib/seo";

const strip = (html: string) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

/**
 * 입지 분석 · 개원 지원 분야별 페이지 (/analysis/<slug>/, /support/<slug>/).
 * 구성: 상단 비주얼(분석 보드) → 소개(헤드라인·사진·필요성과 가치) → 분석 항목 → 리포트 구성 → 협력 파트너
 *      → 진행 절차 → 핵심 제공 서비스 → 자주 묻는 질문 → 같은 그룹 다른 분야. 비어 있는 항목은 섹션을 건너뛴다.
 * 문구는 content/services.json, 페이지 끝 상담 CTA 는 레이아웃 공통 CtaBand.
 */
export default function ServiceDetail({ s }: { s: Service }) {
  const g = GROUPS[s.group];
  const others = servicesIn(s.group).filter((o) => o.slug !== s.slug);
  const url = `${siteUrl}${serviceHref(s)}`;
  const ld: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: s.title,
      serviceType: g.title,
      description: strip(s.desc),
      url,
      areaServed: ["서울특별시", "경기도", "인천광역시"],
      provider: { "@type": "ProfessionalService", name: site.brand.name, url: `${siteUrl}/`, telephone: site.company.tel },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: g.title, item: `${siteUrl}${g.href}` },
        { "@type": "ListItem", position: 3, name: s.title, item: url },
      ],
    },
  ];
  if (s.faq?.length) {
    ld.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: s.faq.map((f) => ({ "@type": "Question", name: strip(f.q), acceptedAnswer: { "@type": "Answer", text: strip(f.a) } })),
    });
  }

  return (
    <>
      <JsonLd data={ld} />
      <SubTop en={s.en} title={s.title} desc={s.desc} visual={s.visual} bg={s.group} />

      <section className="sub_con sec_svc_hero">
        <div className="wrap">
          <nav className="mr-crumb aos" aria-label="현재 위치">
            <Link href="/">홈</Link><i className="xi-angle-right-min"></i><Link href={g.href}>{g.title}</Link><i className="xi-angle-right-min"></i><span>{s.short || s.title}</span>
          </nav>
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

      {s.analysis?.items?.length ? (
        <section className="sub_con sec_svc_analysis">
          <div className="wrap">
            <div className="mr-sec-head aos">
              <em className="mr-pill">What We Analyze</em>
              <h3 dangerouslySetInnerHTML={{ __html: s.analysis.title }} />
              {s.analysis.desc ? <p dangerouslySetInnerHTML={{ __html: s.analysis.desc }} /> : null}
            </div>
            <ul className="mr-agrid aos2">
              {s.analysis.items.map((it, i) => (
                <li key={it.label}>
                  <div className="top"><i className={it.icon}></i><em>{String(i + 1).padStart(2, "0")}</em></div>
                  <h5>{it.label}</h5>
                  <p>{it.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {s.report?.items?.length ? (
        <section className="sub_con sec_svc_report">
          <div className="wrap">
            <div className="mr-report">
              <div className="l aos">
                <em className="mr-pill">Deliverable</em>
                <h3 dangerouslySetInnerHTML={{ __html: s.report.title }} />
                {s.report.desc ? <p dangerouslySetInnerHTML={{ __html: s.report.desc }} /> : null}
                <ol>
                  {s.report.items.map((it, i) => <li key={it}><em>{String(i + 1).padStart(2, "0")}</em><span>{it}</span></li>)}
                </ol>
              </div>
              <div className="r aos2"><AnalysisBoard kind="report" /></div>
            </div>
          </div>
        </section>
      ) : null}

      {s.partner ? (
        <section className="sub_con sec_partner">
          <div className="wrap">
            <div className="mr-partner aos">
              <div className="brand">
                <em className="mr-pill">{s.partner.label || "PARTNER"}</em>
                {s.partner.logo ? <img src={s.partner.logo} alt={s.partner.name} /> : <strong className="wordmark">{s.partner.name}</strong>}
              </div>
              <div className="body">
                <h3 dangerouslySetInnerHTML={{ __html: s.partner.headline }} />
                <p dangerouslySetInnerHTML={{ __html: s.partner.desc }} />
                {s.partner.items?.length ? <ul>{s.partner.items.map((it) => <li key={it}><i className="xi-check"></i>{it}</li>)}</ul> : null}
                {s.partner.note ? <small>{s.partner.note}</small> : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {s.process?.length ? (
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
      ) : null}

      {s.points?.length ? (
        <section className="sub_con sec_svc_keys">
          <div className="wrap">
            <div className="mr-keys-head">
              <div className="l aos"><em className="mr-pill">Our Key Deliverables</em><h3>핵심 제공 서비스</h3></div>
              {s.keysDesc ? <p className="aos2" dangerouslySetInnerHTML={{ __html: s.keysDesc }} /> : null}
            </div>
            <KeyCards items={s.points} />
          </div>
        </section>
      ) : null}

      {s.faq?.length ? (
        <section className="sub_con sec_faq">
          <div className="wrap">
            <div className="mr-faq">
              <div className="head aos"><em className="mr-pill">FAQ</em><h3>자주 묻는 질문</h3></div>
              <div className="list aos2">
                {s.faq.map((f, i) => (
                  <details key={f.q} open={i === 0}>
                    <summary><em>Q</em><span dangerouslySetInnerHTML={{ __html: f.q }} /><i className="xi-angle-down-min"></i></summary>
                    <p dangerouslySetInnerHTML={{ __html: f.a }} />
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {others.length ? (
        <section className="sub_con sec_others">
          <div className="wrap">
            <div className="mr-others">
              <em>{g.title} 다른 분야</em>
              <ul>
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link href={serviceHref(o)}>
                      <i className={o.icon}></i>
                      <span><b>{o.title}</b><small>{o.en}</small></span>
                      <i className="xi-long-arrow-right"></i>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
