/** 페이지 하단 어두운 CTA 띠 (개원컨설팅 · 개원입지 · 로드맵) */
export default function CtaSection({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="sub_con mr-cta">
      <div className="wrap">
        <h4 className="aos">{title}</h4>
        <p className="aos2">{desc}</p>
        <div className="btns aos2">{children}</div>
      </div>
    </section>
  );
}
