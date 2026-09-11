"use client";

/**
 * 개원 실적 로고월. 지역 구분 없이 한 줄로 이어 붙여 한 화면에 15곳(모바일 6곳)씩 보여주고,
 * 화면에 보이는 동안 일정 시간마다 다음 묶음으로 넘어간다 (끝에 닿으면 처음으로). 마우스를 올리거나 손을 대면 멈춘다.
 * 로고 파일이 있는 병원은 로고를, 없는 병원은 임시로 메디로드 심볼을 보여준다 (lib/clinics.ts 참고).
 */
import { useEffect, useRef, useState } from "react";
import type { Clinic } from "@/lib/clinics";

const PER_PAGE = 15;
const PER_PAGE_MOBILE = 6;
const INTERVAL = 4500;
/** 로고 파일이 아직 없는 병원에 임시로 넣는 메디로드 심볼 */
const PLACEHOLDER = "/brand/symbol-mark.png";

export default function ClinicWall({ items }: { items: Clinic[] }) {
  const [perPage, setPerPage] = useState(PER_PAGE);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 화면에 보일 때만 넘긴다 (섹션에 도착하기 전에 첫 묶음을 지나쳐 버리지 않도록)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const apply = () => setPerPage(mq.matches ? PER_PAGE_MOBILE : PER_PAGE);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // 로고가 있는 곳을 앞에 세운다
  const list = [...items.filter((c) => c.logo), ...items.filter((c) => !c.logo)];
  const pages: Clinic[][] = [];
  for (let i = 0; i < list.length; i += perPage) pages.push(list.slice(i, i + perPage));
  const cur = Math.min(page, pages.length - 1);

  useEffect(() => {
    if (paused || !inView || pages.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setPage((p) => (p + 1) % pages.length), INTERVAL);
    return () => clearInterval(t);
  }, [paused, inView, pages.length]);

  return (
    <div
      className="mr-wall-slider"
      ref={ref}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="viewport">
        <div className="track" style={{ transform: `translateX(-${cur * 100}%)` }}>
          {pages.map((pg, i) => (
            <ul className="mr-wall" key={i} aria-hidden={i !== cur}>
              {pg.map((c) => (
                <li key={c.name} className={c.logo ? "has-logo" : "is-ph"}>
                  <div className="mark">
                    <img src={c.logo ?? PLACEHOLDER} alt={c.logo ? c.name : ""} loading="lazy" />
                  </div>
                  <em><b>{c.name}</b>{c.dept === "기타" ? c.region : `${c.dept} · ${c.region}`}</em>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      {pages.length > 1 && (
        <div className="pager">
          {pages.map((_, i) => (
            <button type="button" key={i} className={i === cur ? "on" : ""} aria-label={`${i + 1}번째 묶음 보기`} onClick={() => setPage(i)} />
          ))}
          <span>{String(cur + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}</span>
        </div>
      )}
    </div>
  );
}
