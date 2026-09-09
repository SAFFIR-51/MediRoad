"use client";

import Link from "next/link";

/** 매물 상세 → 상담 신청. 폼의 요청사항에 매물 정보가 자동으로 채워지도록 sessionStorage 에 기록 */
export default function ConsultLink({ code, note }: { code: string; note: string }) {
  return (
    <Link className="btn" href={`/contact?listing=${encodeURIComponent(code)}`} onClick={() => { try { sessionStorage.setItem("mr_listing", note); } catch {} }}>
      <span>이 매물 상담 신청</span><i className="xi-long-arrow-right"></i>
    </Link>
  );
}
