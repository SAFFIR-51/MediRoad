import { content } from "@/lib/site";
import { Lines } from "@/components/ui/Text";

const pics = ["/images/photo-value-plan.jpg", "/images/photo-value-city.jpg", "/images/photo-value-doctor.jpg"];

/** 홈 세 번째 섹션: 세 가지 가치 (원본 sec_vision, 어두운 배경) */
export default function ValuesSection() {
  const v = content.values;
  return (
    <section className="main_con sec_vision">
      <div className="tt taC wht">
        <h3><span dangerouslySetInnerHTML={{ __html: v.title }} /></h3>
        <h4>[ {v.en} ]</h4>
      </div>
      <div className="con aos">
        {v.items.map((it, i) => (
          <div className="item" key={it.label}>
            <div className="pic"><img src={pics[i]} alt="" /></div>
            <div className="txt">
              <i></i>
              <h4>{it.label}</h4>
              <p><Lines lines={it.text} /></p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
