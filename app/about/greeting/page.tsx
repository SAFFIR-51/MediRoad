import type { Metadata } from "next";
import SubTop from "@/components/layout/SubTop";
import CeoBlock from "@/components/about/CeoBlock";
import { content } from "@/lib/site";

export const metadata: Metadata = { title: "인사말" };

/** 인사말 (간소화): 대표 메시지 한 섹션. 문구는 content.json message */
export default function GreetingPage() {
  const g = content.greeting;
  return (
    <>
      <SubTop en={g.en} title={g.title} desc={g.desc} />
      <CeoBlock />
    </>
  );
}
