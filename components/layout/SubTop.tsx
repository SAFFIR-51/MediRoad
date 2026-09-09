/** 하위 페이지 상단 비주얼 (원본 소개 페이지의 subtop 구조) */
export default function SubTop({ en, title, desc, compact = false }: { en: string; title: string; desc?: string; compact?: boolean }) {
  return (
    <section className={`sub_con subtop${compact ? " compact" : ""}`}>
      <div className="bg"></div>
      <div className="txt">
        <em className="aos">{en}</em>
        <div className="inner aos2">
          <h2>{title}</h2>
          {desc ? <p dangerouslySetInnerHTML={{ __html: desc }} /> : null}
        </div>
      </div>
    </section>
  );
}
