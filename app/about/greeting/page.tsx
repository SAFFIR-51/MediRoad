import SubTop from "@/components/layout/SubTop";
import CeoBlock from "@/components/about/CeoBlock";
import { content, type Visual } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/about/greeting", { title: "인사말" });

/** 인사말: 대표 메시지 한 섹션. 문구는 content.json message · greeting */
export default function GreetingPage() {
  const g = content.greeting;
  return (
    <>
      <SubTop en={g.en} title={g.title} desc={g.desc} visual={((g as { visual?: Visual }).visual) || "catchment"} bg="about" />
      <CeoBlock />
    </>
  );
}
