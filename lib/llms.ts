/**
 * /llms.txt · /llms-full.txt 본문 (https://llmstxt.org 형식).
 * AI 답변엔진이 사이트 전체를 빠르게 파악하도록 회사 요약 · 주요 페이지 · FAQ 를 마크다운으로 정리한다.
 * 모든 문구는 content/*.json 에서 가져오므로 사이트 문구를 고치면 다음 빌드에 함께 바뀐다.
 */
import { content, site, services, servicesIn, serviceHref, GROUPS, type ServiceGroup } from "@/lib/site";
import { seoGlobal, siteUrl } from "@/lib/seo";
import { faqSections, stripHtml } from "@/lib/aeo";
import timeline from "@/content/opening-timeline.json";
import seoJson from "@/content/seo.json";

const c = site.company;
const groups: ServiceGroup[] = ["analysis", "support", "partners"];
const abs = (href: string) => `${siteUrl}${href}`;
const pages = (seoJson as unknown as { pages: Record<string, { description?: string }> }).pages;
/** 목록 설명: 검색 설명문(seo.json)이 있으면 그것을, 없으면 분야 소개 문구 */
const descOf = (href: string, fallback: string) => pages[href.replace(/\/$/, "")]?.description || stripHtml(fallback);

function summary() {
  return [
    `# ${site.brand.name} (${site.brand.nameEn}) — ${c.name}`,
    "",
    `> ${seoGlobal.description}`,
    "",
    stripHtml(content.about.slogan.desc),
    "",
    `- 상호: ${c.name} · 대표: ${c.ceo} · 사업자등록번호: ${c.bizNo}`,
    `- 주소: ${c.address} · 마곡나루역 인근`,
    `- 전화: ${c.tel} · 이메일: ${c.email} · 상담: 평일 09:00–18:00, 방문 상담은 사전 예약`,
    "- 서비스 지역: 서울특별시 · 경기도 · 인천광역시",
    `- 함께 개원한 병·의원: ${content.portfolio.groups.reduce((n, g) => n + g.items.length, 0)}곳 (서울 마곡·노원·중랑·목동 등)`,
  ].join("\n");
}

export function llmsTxt() {
  const lines = [summary(), ""];
  for (const g of groups) {
    lines.push(`## ${GROUPS[g].title}`, "", `- [${GROUPS[g].title} 소개](${abs(GROUPS[g].href)})`);
    for (const s of servicesIn(g)) lines.push(`- [${s.title}](${abs(serviceHref(s))}): ${descOf(serviceHref(s), s.desc)}`);
    lines.push("");
  }
  lines.push(
    "## 회사 · 상담",
    "",
    `- [회사소개](${abs("/about/")})`,
    `- [대표 인사말](${abs("/about/greeting/")})`,
    `- [오시는 길](${abs("/about/location/")})`,
    `- [자주 묻는 질문](${abs("/faq/")}): 개원 입지 분석·인허가·의료광고·개원 준비 Q&A`,
    `- [상담신청](${abs("/contact/")})`,
    "",
    "## Optional",
    "",
    `- [전체 본문 요약 (llms-full.txt)](${abs("/llms-full.txt")})`,
    `- [이용약관](${abs("/terms/")})`,
    `- [개인정보처리방침](${abs("/privacy/")})`,
    "",
  );
  return lines.join("\n");
}

export function llmsFullTxt() {
  const L: string[] = [summary(), ""];
  const m = content.analysisMethod;
  L.push(`## ${m.title}`, "", stripHtml(m.desc), "");
  for (const l of m.layers) L.push(`- ${l.label}: ${l.desc} (자료: ${l.source})`);
  L.push("", "## 입지 분석 진행 절차", "");
  for (const s of content.analysisProcess) L.push(`${Number(s.no)}. ${s.title} — ${s.desc}`);
  L.push("");

  for (const s of services) {
    L.push(`## ${s.title}`, "", `URL: ${abs(serviceHref(s))}`, "", stripHtml(s.desc), "", stripHtml(s.value), "");
    if (s.analysis?.items?.length) {
      L.push(`### ${stripHtml(s.analysis.title)}`, "");
      for (const it of s.analysis.items) L.push(`- ${it.label}: ${it.desc}`);
      L.push("");
    }
    if (s.report?.items?.length) {
      L.push(`### ${stripHtml(s.report.title)}`, "");
      for (const it of s.report.items) L.push(`- ${stripHtml(it)}`);
      L.push("");
    }
    if (s.process?.length) {
      L.push("### 진행 절차", "");
      for (const st of s.process) L.push(`${Number(st.no) || st.no}. ${st.title} — ${st.desc}`);
      L.push("");
    }
  }

  L.push("## 병·의원 개원 준비 6단계 (개원 타임라인)", "", `URL: ${abs("/support/")}`, "", "시점은 일반적인 진행 예시이며 실제 기간은 현장마다 다릅니다.", "");
  timeline.steps.forEach((s, i) => {
    L.push(`### ${i + 1}. ${s.title} (${s.when} · ${s.phase})`, "", s.desc, "");
    for (const ck of s.checks) L.push(`- ${ck}`);
    for (const tip of s.tips ?? []) L.push(`- 참고: ${tip}`);
    L.push("");
  });

  L.push("## 자주 묻는 질문", "", `URL: ${abs("/faq/")}`, "");
  for (const sec of faqSections()) {
    L.push(`### ${sec.title}`, "");
    for (const f of sec.items) L.push(`**Q. ${stripHtml(f.q)}**`, "", `A. ${stripHtml(f.a)}`, "");
  }
  return L.join("\n");
}
