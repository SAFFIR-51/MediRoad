/** 사진 3장 스트립 (인사말 · 오시는 길 · 상담 절차) */
export default function PhotoStrip({ items, title, en, desc, noTop = false }: { items: { img: string; title: string; desc: string; no?: string }[]; title: string; en: string; desc?: string; noTop?: boolean }) {
  return (
    <section className={`sub_con sec_white${noTop ? " no-top" : ""}`}>
      <div className="wrap">
        <div className="tt taC"><em>{en}</em><h4><b>{title}</b></h4>{desc ? <p>{desc}</p> : null}</div>
        <div className="mr-strip aos">
          {items.map((it) => (
            <div className="item" key={it.title}>
              <div className="pic"><img src={it.img} alt={it.title} loading="lazy" /></div>
              <div className="txt">{it.no ? <em>{it.no}</em> : null}<h5>{it.title}</h5><p>{it.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IconRow({ items }: { items: { icon: string; title: string }[] }) {
  return (
    <section className="sub_con sec_white no-bottom">
      <div className="wrap">
        <div className="mr-iconrow aos">
          {items.map((it) => <div className="item" key={it.title}><img src={it.icon} alt="" /><span>{it.title}</span></div>)}
        </div>
      </div>
    </section>
  );
}

export function BenefitStrip({ items }: { items: { img: string; icon: string; title: string; desc: string }[] }) {
  return (
    <>
      <div className="mr-benefits-title">MEMBERSHIP BENEFITS · 회원 혜택</div>
      <div className="mr-benefits">
        {items.map((b) => (
          <div className="item" key={b.title}>
            <div className="pic"><img className="ph" src={b.img} alt={b.title} loading="lazy" /><img className="ic" src={b.icon} alt="" /></div>
            <div className="txt"><h5>{b.title}</h5><p>{b.desc}</p></div>
          </div>
        ))}
      </div>
    </>
  );
}
