"use client";

/** 관리자 대시보드: 신규 문의·매물 현황 요약과 바로가기 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Stats } from "@/components/admin/types";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [locVisible, setLocVisible] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stats & { ok: boolean }>("admin/stats.php").then(setStats).catch((e: Error) => setError(e.message));
    api<{ settings: { locationMenuVisible: boolean } }>("settings.php").then((r) => setLocVisible(r.settings.locationMenuVisible)).catch(() => setLocVisible(null));
  }, []);

  const cards = stats
    ? [
        { href: "/admin/inquiries/?status=new", label: "신규 상담 문의", value: stats.inquiriesNew, hot: stats.inquiriesNew > 0 },
        { href: "/admin/listings/?status=open", label: "노출 중인 매물", value: stats.listingsOpen },
        { href: "/admin/listings/?status=closed", label: "거래완료 매물", value: stats.listingsClosed },
        { href: "/admin/listings/?status=hidden", label: "비노출 매물", value: stats.listingsHidden },
        { href: "/admin/listings/", label: "예시 매물", value: stats.listingsSample, hot: stats.listingsSample > 0 },
        { href: "/admin/", label: "가입 회원", value: stats.members },
      ]
    : [];

  return (
    <div className="adm-dash">
      {error ? <div className="mr-flash error">{error}</div> : null}
      <div className="adm-cards">
        {stats ? cards.map((c) => (
          <Link key={c.label} href={c.href} className={`adm-card${c.hot ? " hot" : ""}`}>
            <em>{c.label}</em>
            <b>{c.value.toLocaleString("ko-KR")}</b>
          </Link>
        )) : Array.from({ length: 6 }, (_, i) => <div key={i} className="adm-card ghost" />)}
      </div>
      <div className="adm-panels">
        <div className="adm-panel">
          <h4>매물 관리</h4>
          <p>계약이 끝난 매물은 <b>통보받은 날부터 3일 안에</b> 거래완료 또는 비노출로 바꿔 주세요. 바꾸는 즉시 회원 화면에서 사라집니다.</p>
          {stats && stats.listingsSample > 0 ? <p className="warn">예시 매물 {stats.listingsSample}건이 남아 있습니다. 오픈 전에 매물 관리에서 한 번에 삭제해 주세요.</p> : null}
          <div className="btns"><Link className="mr-btn" href="/admin/listings/edit/">매물 등록</Link><Link className="mr-btn line" href="/admin/listings/">매물 목록</Link></div>
        </div>
        <div className="adm-panel">
          <h4>매물 정보 메뉴</h4>
          <p>현재 상태: {locVisible === null ? "확인 중" : locVisible ? <b className="on">노출</b> : <b className="off">미노출</b>}</p>
          <p>미노출로 바꾸면 헤더·모바일 메뉴·홈의 매물 링크가 숨겨지고, 매물 주소로 직접 들어오면 홈으로 이동합니다 (관리자는 계속 볼 수 있음).</p>
          <div className="btns"><Link className="mr-btn line" href="/admin/settings/">설정 바꾸기</Link></div>
        </div>
      </div>
    </div>
  );
}
