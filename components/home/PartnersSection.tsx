import Link from "next/link";
import { content } from "@/lib/site";

type PartnerItem = { field: string; desc: string; icon: string; href: string; names: string[] };

/** 협력 분야: 7개 파트너 페이지로 연결되는 아이콘 타일 (위 4개 · 아래 3개). 데이터: content/content.json partners */
export default function PartnersSection({ sub = false }: { sub?: boolean }) {
  const p = content.partners as typeof content.partners & { items: PartnerItem[] };
  return (
    <section className={`${sub ? "sub_con" : "main_con"} sec_partners`} id="partners">
      <div className="wrap">
        <div className="tt taC">
          <h4 className="en">{p.en}</h4>
          <h3><span><b>{p.title}</b></span></h3>
          <p>{p.desc}</p>
        </div>
        <div className="mr-areas links aos">
          {p.items.map((it) => (
            <Link className="item" href={it.href} key={it.field}>
              <i className={it.icon}></i>
              <div>
                <h5>{it.field}</h5>
                <p>{it.desc}</p>
                {it.names.length > 0 && <span className="names">{it.names.join(" · ")}</span>}
                <span className="go">자세히 보기 <i className="xi-long-arrow-right"></i></span>
              </div>
            </Link>
          ))}
        </div>
        <p className="mr-pf-note">{p.note}</p>
      </div>
    </section>
  );
}
