"use client";

/** 핵심 제공 서비스 카드 캐러셀 (참고 사이트의 Key 01~N 이미지 카드 + 좌우 화살표). 스크롤 스냅 기반. */
import { useRef } from "react";

export type KeyItem = { title: string; desc: string; image: string };

export default function KeyCards({ items }: { items: KeyItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".card");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };
  return (
    <div className="mr-keys aos">
      <div className="track" ref={ref}>
        {items.map((it, i) => (
          <div className="card" key={it.title} style={{ backgroundImage: `url(${it.image})` }}>
            <div className="in">
              <em>Key {String(i + 1).padStart(2, "0")}</em>
              <h5>{it.title}</h5>
              <p>{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="nav">
        <button type="button" aria-label="이전" onClick={() => move(-1)}><i className="xi-long-arrow-left"></i></button>
        <button type="button" aria-label="다음" onClick={() => move(1)}><i className="xi-long-arrow-right"></i></button>
      </div>
    </div>
  );
}
