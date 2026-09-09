"use client";

import { useEffect } from "react";
import { privacySections } from "@/lib/privacy";

/** 상담 폼의 [ 개인정보처리방침 ] 링크 팝업 */
export default function PrivacyModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="mr-modal" onClick={onClose}>
      <div className="box" onClick={(e) => e.stopPropagation()}>
        <div className="head"><span>개인정보처리방침</span><button type="button" aria-label="닫기" onClick={onClose}>&times;</button></div>
        <div className="body">
          {privacySections.map((s) => (<div key={s.h}><b>{s.h}</b>{"\n"}{s.p}{"\n\n"}</div>))}
        </div>
      </div>
    </div>
  );
}
