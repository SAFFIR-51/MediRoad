"use client";

/**
 * 홈 히어로 슬라이드.
 * 원본과 구분되는 지점: 가운데 도트 + 우측 카운터로 갈라져 있던 인디케이터를 좌측 한 줄로 모았다.
 * 지역·업종 입지 검색은 아래 "추천 개원지" 섹션에 둔다 (components/home/LocationSearch.tsx).
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { content } from "@/lib/site";

const INTERVAL = 5500;

export default function HeroSlider() {
  const slides = content.heroSlides;
  const [cur, setCur] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCur((c) => (c + 1) % slides.length), INTERVAL);
    return () => clearInterval(t);
  }, [slides.length, cur]);

  return (
    <section className="main_con main_visual">
      <div className="hero-slides">
        {slides.map((s, i) => (
          <div className={`slide${i === cur ? " slick-active" : ""}`} key={i} style={{ backgroundImage: `url(${s.bg})` }} aria-hidden={i !== cur}>
            <div className="wrap">
              <div className="txt">
                <h2 dangerouslySetInnerHTML={{ __html: s.title }} />
                <div className="inner">
                  <h4 dangerouslySetInnerHTML={{ __html: s.subtitle }} />
                  <p dangerouslySetInnerHTML={{ __html: s.desc }} />
                  <Link href={s.href}><span>{s.button}</span><i className="xi-long-arrow-right"></i></Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hero-bar">
        <div className="hero-bar-in">
          <div className="hero-nav">
            <ul className="slick-dots" role="tablist">
              {slides.map((_, i) => (
                <li key={i} className={i === cur ? "slick-active" : ""}>
                  <button type="button" onClick={() => setCur(i)} aria-label={`${i + 1}번 슬라이드`}>{i + 1}</button>
                </li>
              ))}
            </ul>
            <div className="hero-count"><b className="cur">{String(cur + 1).padStart(2, "0")}</b> / {String(slides.length).padStart(2, "0")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
