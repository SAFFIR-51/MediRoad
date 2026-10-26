import SubTop from "@/components/layout/SubTop";
import CeoBlock from "@/components/about/CeoBlock";
import { content, type Visual } from "@/lib/site";
import { pageMeta, siteUrl } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbLd, ORG_ID } from "@/lib/aeo";

export const metadata = pageMeta("/about/greeting", { title: "인사말" });

/** 인사말: 대표 메시지 한 섹션. 문구는 content.json message · greeting */
export default function GreetingPage() {
  const g = content.greeting;
  return (
    <>
      <JsonLd data={[breadcrumbLd([["회사소개", "/about/"], ["인사말", "/about/greeting/"]]), { "@context": "https://schema.org", "@type": "AboutPage", url: `${siteUrl}/about/greeting/`, name: "메디로드 대표 인사말", about: { "@id": ORG_ID } }]} />
      <SubTop en={g.en} title={g.title} desc={g.desc} visual={((g as { visual?: Visual }).visual) || "catchment"} bg="about" />
      <CeoBlock />
    </>
  );
}
