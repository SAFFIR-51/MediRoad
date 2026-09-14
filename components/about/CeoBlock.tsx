import { content } from "@/lib/site";

/**
 * 인사말 페이지의 유일한 섹션: 대표 메시지와 원장님께 드리는 글을 합친 편지형 블록.
 * 상단 비주얼(사진 배경) 바로 아래라 사진을 한 번 더 쓰지 않고, 흰 배경에
 * 좌측 헤드라인(스크롤 시 고정) · 우측 본문 + 서명으로 둔다.
 * 문구는 content.json message, 서명은 greeting.signature.
 */
export default function CeoBlock() {
  const m = content.message;
  const g = content.greeting;
  return (
    <section className="sub_con sec_white mr-greet">
      <div className="wrap">
        <div className="mr-greet-in">
          <div className="head aos">
            <em>CEO MESSAGE</em>
            <h3 dangerouslySetInnerHTML={{ __html: m.headline }} />
          </div>
          <div className="letter aos2">
            {m.body.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
            <div className="sign">{g.signature}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
