"use client";

/**
 * 원본 사이트의 스크롤 연출 그대로:
 *  - .main_con / .sub_con 이 화면 70% 지점에 들어오면 .on (섹션 페이드인)
 *  - .tt h3 제목 리빌, .anipic
 *  - --vh (모바일 100vh 보정), body.scrolled (헤더 색 전환)
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const setVh = () => document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    setVh();
    const onScroll = () => { if (!document.body.classList.contains("menu-open")) document.body.classList.toggle("scrolled", window.scrollY > 40); };
    onScroll();
    window.addEventListener("resize", setVh);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("resize", setVh); window.removeEventListener("scroll", onScroll); };
  }, []);

  useEffect(() => {
    // class 속성이 빈 문자열로 남으면 아직 hydrate 되지 않은 영역에서 속성 불일치 경고가 나므로 제거
    const off = (el: HTMLElement) => { el.classList.remove("on"); if (!el.className) el.removeAttribute("class"); };
    const triggers: ScrollTrigger[] = [];
    const targets = document.querySelectorAll<HTMLElement>(".main_con, .sub_con, .main_con .tt h3, .sub_con .tt h3, .anipic");
    targets.forEach((el) => {
      triggers.push(ScrollTrigger.create({
        trigger: el,
        start: "top 70%",
        onEnter: () => el.classList.add("on"),
        onEnterBack: () => el.classList.add("on"),
        onLeaveBack: () => off(el),
        onLeave: () => off(el),
      }));
    });
    // 첫 화면(히어로/서브비주얼)은 즉시 표시
    document.querySelectorAll(".main_visual, .subtop").forEach((el) => el.classList.add("on"));
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => { clearTimeout(t); triggers.forEach((tr) => tr.kill()); };
  }, [pathname]);

  return null;
}
