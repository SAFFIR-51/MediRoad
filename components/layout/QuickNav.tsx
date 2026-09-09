"use client";

import { site } from "@/lib/site";

const items = [
  { href: site.contact.propertyMap, icon: "/brand/icons/property.png", label: "물건안내" },
  { href: site.contact.blog, icon: "/brand/icons/blog.png", label: "블로그" },
  { href: site.contact.youtube, icon: "/brand/icons/youtube.png", label: "유튜브" },
  { href: site.contact.naverMap, icon: "/brand/icons/map.png", label: "네이버지도" },
];

export default function QuickNav() {
  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <nav className="quick-nav">
      <div className="visible-lg">
        <ul>
          {items.map((it) => (
            <li key={it.label}>
              <a href={it.href} target={it.href === "#" ? undefined : "_blank"} rel="noopener">
                <figure>
                  <img src={it.icon} alt="" />
                  <figcaption>{it.label}</figcaption>
                </figure>
              </a>
              <a href={it.href} className="h">{it.label}</a>
            </li>
          ))}
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
