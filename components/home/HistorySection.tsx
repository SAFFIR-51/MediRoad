"use client";

/** 홈 연혁/실적: 숫자 카운트 애니메이션 + 타임라인 */
import { useEffect, useRef } from "react";
import { content } from "@/lib/site";

export default function HistorySection() {
  const h = content.history;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current; if (!root) return;
    const els = root.querySelectorAll<HTMLElement>(".cnt");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target as HTMLElement; io.unobserve(el);
        const target = parseInt((el.dataset.count || "0").replace(/[^0-9]/g, ""), 10) || 0;
        let start: number | null = null;
        const step = (ts: number) => {
          if (start === null) start = ts;
          const p = Math.min(1, (ts - start) / 1400);
          el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="main_con sec_history" id="history">
      <div className="tt taC">
        <h3><span><b>{h.title}</b></span></h3>
        <h4>[ {h.en} ]</h4>
        <p>{h.desc}</p>
      </div>
      <div className="wrap" ref={ref}>
        <div className="mr-stat-row aos">
          {h.stats.map((s) => (
            <div className="item" key={s.label}>
              <b><span className="cnt" data-count={s.value}>0</span><small>{s.suffix}</small></b>
              <em>{s.label}</em>
            </div>
          ))}
        </div>
        <ul className="mr-timeline aos2">
          {h.timeline.map((t, i) => <li key={i}><em>{t.year}</em><p>{t.text}</p></li>)}
        </ul>
      </div>
    </section>
  );
}
