"use client";

/**
 * 로그인 상태 (브라우저 전용).
 * router.php 가 <html data-auth="guest|member|admin"> 를 넣어 주므로 헤더 링크는 CSS 로만 전환하고,
 * 사용자 정보가 필요한 화면(관리자·매물)만 /api/auth/me.php 를 호출한다.
 */
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export type User = { id: number; email: string; name: string; phone: string; role: "member" | "admin" };
export type AuthLevel = "guest" | "member" | "admin";

/** router.php 가 주입한 로그인 단계. next dev 처럼 속성이 없으면 null */
export function authFromHtml(): AuthLevel | null {
  if (typeof document === "undefined") return null;
  const v = document.documentElement.dataset.auth;
  return v === "guest" || v === "member" || v === "admin" ? v : null;
}

export function useMe() {
  const [state, setState] = useState<{ loading: boolean; user: User | null }>({ loading: true, user: null });
  useEffect(() => {
    let alive = true;
    api<{ user: User | null }>("auth/me.php")
      .then((r) => alive && setState({ loading: false, user: r.user }))
      .catch(() => alive && setState({ loading: false, user: null }));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

/** 로그아웃 후 전체 새로고침으로 홈 이동 (헤더의 data-auth 를 새로 받기 위해) */
export async function logout() {
  try {
    await api("auth/logout.php", { method: "POST", body: {} });
  } catch {
    /* 이미 만료된 세션이어도 홈으로 보낸다 */
  }
  window.location.href = "/";
}
