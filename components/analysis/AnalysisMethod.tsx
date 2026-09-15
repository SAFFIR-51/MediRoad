"use client";

/**
 * "입지 분석, 이렇게 봅니다" — 분석 데이터 레이어 목록 + 우측 분석 보드.
 * 레이어에 마우스를 올리거나 누르면 보드가 해당 자료(반경·연령·유동인구·경쟁·리포트)로 바뀌고,
 * 가만히 두면 일정 간격으로 넘어간다. 문구는 content.json analysisMethod.
 */
import { useEffect, useState } from "react";
import { content, type Visual } from "@/lib/site";
import AnalysisBoard from "@/components/analysis/AnalysisBoard";

type Layer = { icon: string; label: string; desc: string; source?: string; visual?: Visual };
type Method = { en: string; title: string; desc: string; layers: Layer[] };

const CYCLE: Visual[] = ["catchment", "population", "flow", "competition", "report"];
const INTERVAL = 4800;

export default function AnalysisMethod({ sub = false }: { sub?: boolean }) {
  const m = (content as unknown as { analysisMethod: Method }).analysisMethod;
  const layers = m.layers;
  const kindOf = (i: number): Visual => layers[i]?.visual || CYCLE[i % CYCLE.length];
  const kinds = [...new Set(layers.map((_, i) => kindOf(i)))];
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setCur((c) => (c + 1) % layers.length), INTERVAL);
    return () => clearInterval(t);
  }, [paused, layers.length]);

  const active = kindOf(cur);

  return (
    <section className={`${sub ? "sub_con" : "main_con"} sec_method`} id="method">
      <div className="wrap">
        <div className="mr-method">
          <div className="l">
            <div className="tt">
              <h4 className="en">{m.en}</h4>
              <h3><span><b dangerouslySetInnerHTML={{ __html: m.title }} /></span></h3>
              <p dangerouslySetInnerHTML={{ __html: m.desc }} />
            </div>
            <ol className="layers aos" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
              {layers.map((ly, i) => (
                <li key={ly.label} className={i === cur ? "on" : ""}>
                  <button type="button" onMouseEnter={() => setCur(i)} onFocus={() => setCur(i)} onClick={() => setCur(i)} aria-pressed={i === cur}>
                    <i className={ly.icon}></i>
                    <span className="t">
                      <b>{ly.label}</b>
                      <em>{ly.desc}</em>
                      {ly.source ? <small>{ly.source}</small> : null}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div className="r aos2" aria-live="polite">
            <div className="stack">
              {kinds.map((k) => (
                <div className={`layer${k === active ? " on" : ""}`} key={k} aria-hidden={k !== active}>
                  <AnalysisBoard kind={k} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
