"use client";

/**
 * 핵심 제공 서비스 카드 캐러셀. 사진(상단) + 텍스트(하단) 분리형 카드.
 * 좌우 버튼 없이 일정 시간마다 자동으로 넘어가고, 끝에 닿으면 처음으로 돌아온다.
 * 마우스를 올리거나 손으로 넘기는 동안에는 멈춘다.
 */
import { useEffect, useRef, useState } from "react";

export type KeyItem = { title: string; desc: string; image: string };

const INTERVAL = 3800;

export default function KeyCards({ items }: { items: KeyItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      const el = ref.current;
      if (!el || el.scrollWidth <= el.clientWidth + 1) return;
      const card = el.querySelector<HTMLElement>(".card");
      const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + step, behavior: "smooth" });
    }, INTERVAL);
    return () => clearInterval(t);
  }, [paused, items.length]);

  return (
    <div
      className="mr-keys aos"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="track" ref={ref}>
        {items.map((it, i) => (
          <div className="card" key={it.title}>
            <div className="pic" style={{ backgroundImage: `url(${it.image})` }}>
              <em>{String(i + 1).padStart(2, "0")}</em>
            </div>
            <div className="in">
              <h5>{it.title}</h5>
              <p>{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
