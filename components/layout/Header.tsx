"use client";

/**
 * 원본 헤더 구조/동작 그대로:
 *  - PC: 메뉴 항목에 마우스를 올리면 그 항목의 하위 메뉴만 바로 아래로 펼쳐진다 (원본 #gnb > ul > li > div 구조)
 *  - 모바일/전체메뉴: 햄버거 클릭 시 body.nav-opened + .site-map 표시, 헤더 요소 숨김
 * 매물 정보 메뉴(locOnly)는 .loc-only 로 표시해 관리자 설정(data-loc="off")에서 CSS 로 숨긴다.
 * 매물 링크는 서버(router.php)의 로그인 확인을 거치도록 새로고침 이동(<a>)을 쓴다.
 * 로그인 · 로그아웃 · 관리자 링크는 <html data-auth> 에 따라 CSS 로 전환된다.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems, site, type MenuChild } from "@/lib/site";
import { loginHref } from "@/lib/api";
import { logout } from "@/lib/auth-client";

function NavLink({ item, onClick }: { item: MenuChild; onClick?: () => void }) {
  if (item.locOnly) return <a href={item.href} onClick={onClick}>{item.label}</a>;
  return <Link href={item.href} onClick={onClick}>{item.label}</Link>;
}

function AuthLinks({ onNavigate }: { onNavigate?: () => void }) {
  const toLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate?.();
    window.location.href = loginHref();
  };
  return (
    <>
      <li className="auth auth-guest"><a href="/login/" onClick={toLogin}><span>로그인</span></a></li>
      <li className="auth auth-guest"><a href="/signup/" onClick={onNavigate}><span>회원가입</span></a></li>
      <li className="auth auth-admin"><a href="/admin/" onClick={onNavigate}><span>관리자</span></a></li>
      <li className="auth auth-member"><button type="button" onClick={() => logout()}><span>로그아웃</span></button></li>
    </>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const gnbRef = useRef<HTMLElement>(null);

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

  const tel = site.contact.headerTel;
  const close = () => setOpen(false);

  return (
    <>
      <header id="header" ref={headerRef}>
        <div className="container-fluid">
          <h1 className="logo">
            <Link href="/">
              <img src={site.brand.logo.color} alt={site.brand.name} className="mo" />
              <img src={site.brand.logo.white} alt={site.brand.name} className="pc" />
            </Link>
          </h1>
          <nav id="gnb" ref={gnbRef}>
            <ul className="depth1">
              {menuItems.map((m) => (
                <li key={m.href} className={`${m.children ? "has-child" : ""}${m.locOnly ? " loc-only" : ""}`}>
                  <NavLink item={m} />
                  {m.children && (
                    <div>
                      <ul className="depth2">
                        {m.children.map((c) => <li key={c.href} className={c.locOnly ? "loc-only" : undefined}><NavLink item={c} /></li>)}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="btn-area">
            <div className="sns">
              <ul>
                <AuthLinks />
                <li className="contact"><Link href={site.menu.contactButton.href}><span>{site.menu.contactButton.label}</span></Link></li>
                <li className="tel"><a href={`tel:${tel}`} aria-label={`전화 ${tel}`}><i className="xi-call"></i><span>전화</span></a></li>
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
                <li key={m.href} className={`${m.children ? "has-child" : ""}${m.locOnly ? " loc-only" : ""}`}>
                  <NavLink item={m} onClick={close} />
                  {m.children && (
                    <div>
                      <ul className="depth2">
                        {m.children.map((c) => <li key={c.href} className={c.locOnly ? "loc-only" : undefined}><NavLink item={c} onClick={close} /></li>)}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <ul className="util">
              <li><Link href={site.menu.contactButton.href} onClick={close}><span>{site.menu.contactButton.label}</span></Link></li>
              <AuthLinks onNavigate={close} />
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
