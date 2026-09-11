import { content } from "@/lib/site";
import { Lines } from "@/components/ui/Text";

/**
 * 3대 가치.
 * 원본의 세로 사진 카드 3개 대신 넘버링 가로 스트립(1px 선으로 나눈 3칸)으로 구성하고,
 * 섹션 제목은 가운데 정렬 대신 좌측 제목 + 우측 요약의 2단 헤드로 둔다.
 */
export default function ValuesSection() {
  const v = content.values;
  return (
    <section className="main_con sec_values" id="values">
      <div className="wrap">
        <div className="mr-values-head aos">
          <div className="tt">
            <h4 className="en">{v.en}</h4>
            <h3><span dangerouslySetInnerHTML={{ __html: v.title }} /></h3>
          </div>
          <p className="lead">{v.desc}</p>
        </div>
        <ol className="mr-values aos2">
          {v.items.map((it, i) => (
            <li key={it.label}>
              <em className="no">{String(i + 1).padStart(2, "0")}</em>
              <h4>{it.ko}</h4>
              <em className="en">{it.label}</em>
              <p><Lines lines={it.text} /></p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
