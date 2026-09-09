"use client";

/** 원본의 body class 유지: 홈은 is-home, 그 외는 is-sub (+ 경로별 page-* 클래스) */
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function BodyClass() {
  const pathname = usePathname();
  useEffect(() => {
    const b = document.body;
    [...b.classList].filter((c) => c === "is-home" || c === "is-sub" || c.startsWith("page-")).forEach((c) => b.classList.remove(c));
    b.classList.add(pathname === "/" ? "is-home" : "is-sub");
    const seg = pathname.split("/").filter(Boolean)[0];
    if (seg) b.classList.add(`page-${seg}`);
  }, [pathname]);
  return null;
}
