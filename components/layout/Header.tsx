"use client";

/**
 * 원본 헤더 구조/동작 그대로:
 *  - PC: 메뉴 hover 시 헤더 아래로 전체 메뉴 패널(.gnb-all)이 펼쳐지고 헤더는 흰 배경(body.scrolled)으로 전환
 *  - 모바일/전체메뉴: 햄버거 클릭 시 body.nav-opened + .site-map 표시, 헤더 요소 숨김
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems, site } from "@/lib/site";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const gnbRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // 경로가 바뀌면 전체메뉴 닫기
  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const header = headerRef.current, gnb = gnbRef.current;
    if (!header || !gnb) return;
    document.body.classList.toggle("nav-opened", open);
    document.body.style.overflowY = open ? "hidden" : "auto";
    header.classList.toggle("none", open);
    if (open) {
      gnb.style.display = "none";
      header.style.height = "0";
    } else {
      if (window.innerWidth >= 1280) { gnb.style.display = "block"; header.style.height = "120px"; }
      else { gnb.style.display = ""; header.style.height = "60px"; }
      // 초기화 후 원본 CSS 값으로 복귀
      const t = setTimeout(() => { header.style.height = ""; gnb.style.display = ""; }, 350);
      return () => clearTimeout(t);
    }
  }, [open]);

  // PC: 메뉴에 마우스를 올리면 헤더 아래로 전체 메뉴 패널이 펼쳐진다 (헤더는 흰 배경으로 전환)
  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    if (menuOpen) document.body.classList.add("scrolled");
    else if (window.scrollY <= 40) document.body.classList.remove("scrolled");
  }, [menuOpen]);
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const tel = site.contact.headerTel;

  return (
    <>
      <header id="header" ref={headerRef} onMouseLeave={() => setMenuOpen(false)}>
        <div className="container-fluid">
          <h1 className="logo">
            <Link href="/">
              <img src={site.brand.logo.color} alt={site.brand.name} className="mo" />
              <img src={site.brand.logo.white} alt={site.brand.name} className="pc" />
            </Link>
          </h1>
          <nav id="gnb" ref={gnbRef} onMouseEnter={() => setMenuOpen(true)}>
            <ul className="depth1">
              {menuItems.map((m) => (
                <li key={m.href} className={m.children ? "has-child" : ""}>
                  <Link href={m.href}>{m.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="gnb-all" aria-hidden={!menuOpen}>
            <div className="inner">
              {menuItems.map((m) => (
                <div className="col" key={m.href}>
                  <h5><Link href={m.href}>{m.label}</Link>{m.en ? <small>{m.en}</small> : null}</h5>
                  {m.children?.map((c) => <Link key={c.href} href={c.href}>{c.label}</Link>)}
                </div>
              ))}
            </div>
          </div>
          <div className="btn-area">
            <div className="sns">
              <ul>
                <li className="contact"><Link href={site.menu.contactButton.href}><span>{site.menu.contactButton.label}</span></Link></li>
                <li className="tel"><a href={`tel:${tel}`}><i className="xi-call"></i><span>{tel}</span></a></li>
              </ul>
            </div>
            <button type="button" className={`btn-nav${open ? " btn-close" : ""}`} aria-label={open ? "메뉴 닫기" : "메뉴 열기"} onClick={() => setOpen((v) => !v)}>
              <div><span></span><span></span><span></span></div>
            </button>
          </div>
        </div>
      </header>

      {/* 전체메뉴 (모바일/태블릿) */}
      <nav className="site-map">
        <div className="container-fluid">
          <div className="v-align">
            <ul className="depth1">
              {menuItems.map((m) => (
                <li key={m.href} className={m.children ? "has-child" : ""}>
                  <Link href={m.href} onClick={() => setOpen(false)}>{m.label}</Link>
                  {m.children && (
                    <div>
                      <ul className="depth2">
                        {m.children.map((c) => <li key={c.href}><Link href={c.href} onClick={() => setOpen(false)}>{c.label}</Link></li>)}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
