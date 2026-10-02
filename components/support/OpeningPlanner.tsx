"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import timeline from "@/content/opening-timeline.json";

/**
 * 개원 지원 소개: 6단계 체크리스트. 단계 선택 · 항목 체크(브라우저 저장) · 진행률 · 체크 포인트.
 * 간트 개요(TimelineOverview)의 막대는 #stage-<id> 로 이 컴포넌트의 단계를 연다.
 */
const STORAGE_KEY = "mediroad.opening-checklist.v1";
const steps = timeline.steps;
// 문구가 바뀐 항목이 예전 체크 상태를 이어받지 않도록 키에 문구를 포함한다.
const keyOf = (stepId: string, text: string) => `${stepId}:${text}`;
const allKeys = steps.flatMap((step) => step.checks.map((text) => keyOf(step.id, text)));
const validKeys = new Set(allKeys);
const no = (i: number) => String(i + 1).padStart(2, "0");

function readChecks(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((key): key is string => typeof key === "string" && validKeys.has(key)))]
      : [];
  } catch { return []; }
}

const reveal = () => requestAnimationFrame(() => {
  document.getElementById("opening-detail")?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
  document.getElementById("active-step-title")?.focus({ preventScroll: true });
});

export default function OpeningPlanner() {
  const [active, setActive] = useState(0);
  const [checked, setChecked] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [canSave, setCanSave] = useState(true);

  useEffect(() => {
    try { setChecked(readChecks(localStorage.getItem(STORAGE_KEY))); }
    catch { setCanSave(false); }
    setReady(true);
    const syncHash = (event?: HashChangeEvent) => {
      const index = steps.findIndex((step) => `#stage-${step.id}` === window.location.hash);
      if (index < 0) return;
      setActive(index);
      if (event) reveal();
    };
    const syncStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) setChecked(readChecks(event.newValue));
    };
    // 간트 막대처럼 #stage-<id> 로 가는 링크: 주소의 해시가 이미 같으면 hashchange 가 생기지 않으므로 직접 연다.
    const openFromLink = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="#stage-"]');
      if (!link) return;
      const index = steps.findIndex((step) => `#stage-${step.id}` === link.getAttribute("href"));
      if (index < 0) return;
      event.preventDefault();
      setActive(index);
      window.history.replaceState(null, "", `#stage-${steps[index].id}`);
      reveal();
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("storage", syncStorage);
    document.addEventListener("click", openFromLink);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("storage", syncStorage);
      document.removeEventListener("click", openFromLink);
    };
  }, []);

  const selectStep = (index: number, scroll = false) => {
    setActive(index);
    window.history.replaceState(null, "", `#stage-${steps[index].id}`);
    if (scroll || window.matchMedia("(max-width: 1024px)").matches) reveal();
  };
  const toggle = (key: string) => {
    const next = checked.includes(key) ? checked.filter((item) => item !== key) : [...checked, key];
    setChecked(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setCanSave(true); }
    catch { setCanSave(false); }
  };

  const step = steps[active];
  const countOf = (id: string) => checked.filter((key) => key.startsWith(`${id}:`)).length;
  const stepCount = countOf(step.id);
  const completedStages = steps.filter((item) => countOf(item.id) === item.checks.length).length;
  const percentage = Math.round((checked.length / allKeys.length) * 100);
  const nextIndex = steps.findIndex((item) => countOf(item.id) < item.checks.length);
  const nextTask = allKeys.find((key) => !checked.includes(key));
  const nextText = nextTask ? nextTask.slice(nextTask.indexOf(":") + 1) : "모든 항목을 확인했습니다. 실제 준비 현황과 개원 일정을 담당자와 함께 점검해 보세요.";

  return (
    <section className="sub_con sec_planner" id="timeline" aria-labelledby="planner-title">
      <div className="wrap">
        <div className="mr-sec-head aos">
          <em className="mr-pill">My Opening Roadmap</em>
          <h3 id="planner-title">단계별로 <b>확인하고 체크</b>하세요</h3>
          <p>지금 준비 중인 단계를 선택하고, 확인한 항목에 체크해 보세요. 체크 상태는 이 브라우저에 저장됩니다.</p>
        </div>

        <div className="mr-plan-dash aos2">
          <div className="prog">
            <em>체크리스트 확인 현황</em>
            <div className="val"><strong>{percentage}<small>%</small></strong><span>{checked.length} / {allKeys.length}개 확인</span></div>
            <progress max={allKeys.length} value={checked.length} aria-label="체크리스트 확인 진행률" />
            <p>{steps.length}단계 중 <b>{completedStages}단계</b>의 항목을 모두 확인했어요.</p>
          </div>
          <div className="next">
            <em>{nextIndex >= 0 ? `다음 확인 항목 · STEP ${no(nextIndex)} ${steps[nextIndex].short}` : "모든 항목 확인 완료"}</em>
            <p>{nextText}</p>
            {nextIndex >= 0 && <button type="button" onClick={() => selectStep(nextIndex, true)}>이 단계 살펴보기 <i className="xi-long-arrow-right"></i></button>}
          </div>
          <p className="save">
            {!ready ? "저장된 체크 상태를 확인하고 있습니다." : canSave ? "체크 상태는 이 브라우저에 자동 저장되며, 다른 기기에는 동기화되지 않습니다." : "브라우저 저장을 사용할 수 없어 현재 화면에서만 체크할 수 있습니다."}
          </p>
        </div>

        <div className="mr-plan aos2">
          <nav className="steps" aria-label="개원 준비 단계 선택">
            {steps.map((item, i) => {
              const done = countOf(item.id) === item.checks.length;
              return (
                <button type="button" key={item.id} aria-pressed={active === i} aria-controls="opening-detail" onClick={() => selectStep(i)} className={`${active === i ? "on" : ""}${done ? " done" : ""}`}>
                  <span className="n" aria-hidden="true">{done ? <i className="xi-check"></i> : no(i)}</span>
                  <span className="t"><small>{item.when}</small><b>{item.short}</b></span>
                  <span className="c" aria-label={`${item.checks.length}개 중 ${countOf(item.id)}개 확인`}>{countOf(item.id)}/{item.checks.length}</span>
                </button>
              );
            })}
          </nav>

          <div className="detail" id="opening-detail" role="region" aria-labelledby="active-step-title">
            <div className="top">
              <span className="badge">STEP {no(active)}<i></i>{step.when}</span>
              <span className={`state${stepCount === step.checks.length ? " done" : ""}`}>{stepCount === step.checks.length ? "확인 완료" : stepCount ? "확인 중" : "확인 전"}</span>
            </div>
            <h4 id="active-step-title" tabIndex={-1}>{step.title}</h4>
            <p className="desc">{step.desc}</p>

            <div className="checks">
              <div className="ch"><b>이 단계에서 확인할 일</b><span aria-live="polite">{stepCount} / {step.checks.length}</span></div>
              {step.checks.map((text) => {
                const key = keyOf(step.id, text);
                const done = checked.includes(key);
                return (
                  <label key={key} className={done ? "done" : ""}>
                    <input type="checkbox" checked={done} disabled={!ready} onChange={() => toggle(key)} />
                    <span className="box" aria-hidden="true"><i className="xi-check"></i></span>
                    <span className="txt">{text}</span>
                  </label>
                );
              })}
            </div>

            <div className="tips">
              <b><i className="xi-lightbulb-o"></i>체크 포인트</b>
              <ul>{step.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
            </div>

            <dl className="meta">
              <div><dt>다음 단계로 가져갈 것</dt><dd>{step.result}</dd></div>
              <div><dt>함께 확인할 곳</dt><dd>{step.role}</dd></div>
            </dl>
            <div className="links">
              {step.links.map((link) => <Link href={link.href} key={link.href}>{link.label}<i className="xi-long-arrow-right"></i></Link>)}
            </div>

            <div className="pager">
              <button type="button" onClick={() => selectStep(active - 1)} disabled={active === 0}><i className="xi-arrow-left"></i> 이전 단계</button>
              <span>{no(active)} / {no(steps.length - 1)}</span>
              {active < steps.length - 1
                ? <button type="button" onClick={() => selectStep(active + 1)}>다음 단계 <i className="xi-arrow-right"></i></button>
                : <Link href="/contact/">개원 준비 상담 <i className="xi-arrow-right"></i></Link>}
            </div>
          </div>
        </div>
        <p className="mr-tl-note"><i className="xi-error-o"></i>{steps.length}단계는 준비 항목을 나눈 안내이며 일부 업무는 병행합니다. 개설 가능 여부는 계약·설계 전부터 확인하세요. 진행률은 체크한 항목 수이며 실제 준비 완료 여부를 뜻하지 않습니다.</p>
        <noscript>
          <div className="mr-plan-noscript">{steps.map((item, i) => <div key={item.id}><h4>STEP {no(i)} · {item.when} · {item.title}</h4><ul>{item.checks.map((text) => <li key={text}>{text}</li>)}</ul></div>)}</div>
        </noscript>
      </div>
    </section>
  );
}
