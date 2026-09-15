import AnalysisBoard from "@/components/analysis/AnalysisBoard";
import type { Visual } from "@/lib/site";

export type SubTopBg = "about" | "analysis" | "support" | "location" | "contact";

/**
 * 하위 페이지 상단 비주얼.
 * visual 이 있으면 좌측 제목 · 우측 입지 분석 보드(예시 화면) 2단 구성, 없으면 원본처럼 가운데 제목만.
 * bg 는 메뉴 그룹별 배경 사진 (app/styles/components.css .subtop[data-bg]).
 */
export default function SubTop({ en, title, desc, compact = false, visual = "", bg = "about" }: { en: string; title: string; desc?: string; compact?: boolean; visual?: Visual; bg?: SubTopBg }) {
  const hasVisual = !!visual && !compact;
  return (
    <section className={`sub_con subtop${compact ? " compact" : ""}${hasVisual ? " has-visual" : ""}`} data-bg={bg}>
      <div className="bg"></div>
      <div className="subtop-in">
        <div className="txt">
          <em className="aos">{en}</em>
          <div className="inner aos2">
            <h2>{title}</h2>
            {desc ? <p dangerouslySetInnerHTML={{ __html: desc }} /> : null}
          </div>
        </div>
        {hasVisual ? <div className="vis"><AnalysisBoard kind={visual} /></div> : null}
      </div>
    </section>
  );
}
