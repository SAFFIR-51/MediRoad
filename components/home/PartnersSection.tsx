import { content } from "@/lib/site";

/** 협력사: 분야별 아이콘 타일 (경영마케팅 플라노바 · 인증·인허가 전문 행정사 · 인테리어 · 부동산). 데이터: content/content.json partners */
export default function PartnersSection({ sub = false }: { sub?: boolean }) {
  const p = content.partners;
  return (
    <section className={`${sub ? "sub_con" : "main_con"} sec_partners`} id="partners">
      <div className="wrap">
        <div className="tt taC">
          <h4 className="en">{p.en}</h4>
          <h3><span><b>{p.title}</b></span></h3>
          <p>{p.desc}</p>
        </div>
        <div className="mr-areas aos">
          {p.items.map((it) => (
            <div className="item" key={it.field}>
              <i className={it.icon}></i>
              <div>
                <h5>{it.field}</h5>
                <p>{it.desc}</p>
                {it.names.length > 0 && <span className="names">{it.names.join(" · ")}</span>}
              </div>
            </div>
          ))}
        </div>
        <p className="mr-pf-note">{p.note}</p>
      </div>
    </section>
  );
}
