"use client";

/** 관리자 공통 틀: 권한 확인 + 탭 메뉴. 관리자가 아니면 로그인(비로그인) 또는 홈(일반 회원)으로 보낸다. */
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SubTop from "@/components/layout/SubTop";
import { loginHref } from "@/lib/api";
import { logout, useMe } from "@/lib/auth-client";

const TABS = [
  { href: "/admin/", label: "대시보드", icon: "xi-dashboard" },
  { href: "/admin/listings/", label: "매물 관리", icon: "xi-building" },
  { href: "/admin/inquiries/", label: "상담 문의", icon: "xi-comment-o" },
  { href: "/admin/settings/", label: "설정", icon: "xi-cog" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/admin/";
  const { loading, user } = useMe();

  useEffect(() => {
    if (loading) return;
    if (!user) window.location.replace(loginHref());
    else if (user.role !== "admin") window.location.replace("/");
  }, [loading, user]);

  const isOn = (href: string) => (href === "/admin/" ? pathname === "/admin/" || pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      <SubTop en="Admin" title="관리자" compact bg="contact" />
      <section className="sub_con mr-admin">
        <div className="wrap">
          <div className="adm-top">
            <nav className="adm-tabs" aria-label="관리자 메뉴">
              {TABS.map((t) => (
                <Link key={t.href} href={t.href} className={isOn(t.href) ? "on" : ""}><i className={t.icon}></i>{t.label}</Link>
              ))}
            </nav>
            <div className="adm-user">
              {user ? <span><b>{user.name}</b> 님</span> : null}
              <a href="/" className="lnk">사이트 보기</a>
              <button type="button" className="lnk" onClick={() => logout()}>로그아웃</button>
            </div>
          </div>
          {loading || !user || user.role !== "admin" ? <div className="adm-loading">권한을 확인하고 있습니다…</div> : children}
        </div>
      </section>
    </>
  );
}
