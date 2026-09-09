import { content } from "@/lib/site";
import { Lines } from "@/components/ui/Text";

/** 대표 메시지 블록 (원본 소개 페이지 sec_ceo: 사진 + 진한 배경 문구). 회사소개 · 인사말 공용 */
export default function CeoBlock() {
  const m = content.message;
  const g = content.greeting;
  return (
    <section className="sub_con sec_ceo">
      <div className="pic anipic"><img src={g.photo} alt="" /></div>
      <div className="txt">
        <div className="tt wht"><h3><span>CEO Message</span></h3></div>
        <div className="vr"></div>
        <h5 dangerouslySetInnerHTML={{ __html: m.headline }} />
        <p><Lines lines={m.body} /></p>
        <div className="sign">{g.signature}</div>
      </div>
    </section>
  );
}
