"use client";

import Link from "next/link";
import { site } from "@/lib/site";

/** 플로팅 퀵메뉴: 온라인 상담 · 전화 상담 · 매물정보 · TOP (PC 우측 하단 원형, 모바일 하단 바). 블로그·유튜브 등 외부 채널은 운영하지 않음. */
export default function QuickNav() {
  const tel = site.contact.headerTel;
  const items: { href: string; label: string; icon?: string; img?: string; external?: boolean }[] = [
    { href: "/contact", icon: "xi-comment-o", label: "온라인 상담" },
    { href: `tel:${tel}`, icon: "xi-call", label: "전화 상담" },
    { href: "/location", img: "/brand/icons/property.png", label: "매물정보" },
  ];
  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <nav className="quick-nav">
      <div className="visible-lg">
        <ul>
          {items.map((it) => {
            const inner = (
              <figure>
                {it.icon ? <i className={it.icon}></i> : <img src={it.img} alt="" />}
                <figcaption>{it.label}</figcaption>
              </figure>
            );
            const isPage = it.href.startsWith("/");
            return (
              <li key={it.label}>
                {isPage
                  ? <Link href={it.href}>{inner}</Link>
                  : <a href={it.href} target={it.external && it.href !== "#" ? "_blank" : undefined} rel="noopener">{inner}</a>}
                {isPage ? <Link href={it.href} className="h">{it.label}</Link> : <a href={it.href} className="h">{it.label}</a>}
              </li>
            );
          })}
          <li className="last">
            <a href="#top" onClick={(e) => { e.preventDefault(); goTop(); }}>
              <img src="/brand/icons/top.png" alt="" />
              <figcaption>TOP</figcaption>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
