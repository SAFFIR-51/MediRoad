"use client";

/**
 * 로그인 단계와 매물 메뉴 노출을 <html data-auth data-loc> 에 넣는다.
 * 페이지는 정적으로 두고 이 값만 브라우저에서 채워, 헤더·퀵메뉴·홈 매물 섹션이 CSS 로 전환되게 한다.
 * (실제 접근 차단은 proxy.ts 와 API 가 서버에서 처리한다.)
 */
import { useEffect } from "react";

export default function AuthState() {
  useEffect(() => {
    let alive = true;
    const el = document.documentElement;

    const get = async (path: string) => {
      const res = await fetch(`/api/${path}/`, { headers: { Accept: "application/json" }, credentials: "same-origin" });
      return res.ok ? res.json() : null;
    };

    Promise.all([get("auth/me"), get("settings")])
      .then(([me, settings]) => {
        if (!alive) return;
        el.dataset.auth = me?.user ? me.user.role : "guest";
        el.dataset.loc = settings?.settings?.locationMenuVisible === false ? "off" : "on";
      })
      .catch(() => {
        if (alive) el.dataset.auth = "guest";
      });

    return () => {
      alive = false;
    };
  }, []);

  return null;
}
