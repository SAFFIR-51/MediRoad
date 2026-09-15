"use client";

/**
 * 홈 히어로 슬라이드.
 * 사진 배경 위 좌측 하단 문구 + 우측 입지 분석 보드(예시 화면, PC 전용). 보드 종류는 content.json heroSlides[].visual.
 * 인디케이터는 좌측 한 줄(도트) + 우측 카운터.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { content, type Visual } from "@/lib/site";
import AnalysisBoard from "@/components/analysis/AnalysisBoard";

const INTERVAL = 6500;

type Slide = { title: string; subtitle: string; desc: string; button: string; href: string; bg: string; visual?: Visual };

export default function HeroSlider() {
  const slides = content.heroSlides as Slide[];
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
              {s.visual ? <div className="hero-board"><AnalysisBoard kind={s.visual} compact /></div> : null}
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
