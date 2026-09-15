"use client";

/** 관리자 상담 문의 목록: 상태 탭(신규 / 상담중 / 완료) · 행을 누르면 상세 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { INQUIRY_STATUS_LABEL, fmtDateTime, type Inquiry, type InquiryStatus } from "./types";

const TABS: ("" | InquiryStatus)[] = ["new", "in_progress", "done", ""];

export default function InquiryList() {
  const router = useRouter();
  const sp = useSearchParams();
  const [status, setStatus] = useState<"" | InquiryStatus>((sp.get("status") as InquiryStatus) ?? "new");
  const [items, setItems] = useState<Inquiry[] | null>(null);
  const [counts, setCounts] = useState<Record<InquiryStatus, number>>({ new: 0, in_progress: 0, done: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(null);
    api<{ items: Inquiry[]; counts: Record<InquiryStatus, number> }>(`admin/inquiries.php${status ? `?status=${status}` : ""}`)
      .then((r) => { setItems(r.items); setCounts(r.counts); })
      .catch((e: Error) => setError(e.message));
  }, [status]);

  const total = counts.new + counts.in_progress + counts.done;

  return (
    <div className="adm-list">
      <div className="adm-head">
        <div>
          <h3>상담 문의</h3>
          <p>상담신청 페이지로 접수된 문의입니다. 연락을 시작하면 [상담중], 마무리되면 [완료]로 바꿔 주세요.</p>
        </div>
      </div>
      {error ? <div className="mr-flash error">{error}</div> : null}
      <div className="adm-filter">
        <div className="seg">
          {TABS.map((t) => (
            <button key={t || "all"} type="button" className={status === t ? "on" : ""} onClick={() => setStatus(t)}>
              {t ? INQUIRY_STATUS_LABEL[t] : "전체"} <em>{t ? counts[t] : total}</em>
            </button>
          ))}
        </div>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table click">
          <thead><tr><th>접수일시</th><th>성함</th><th>연락처</th><th>진료과목</th><th>희망 지역</th><th>상담유형</th><th>상태</th></tr></thead>
          <tbody>
            {items === null ? (
              <tr><td colSpan={7} className="empty">불러오는 중…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="empty">해당하는 문의가 없습니다.</td></tr>
            ) : (
              items.map((it) => (
                <tr key={it.id} onClick={() => router.push(`/admin/inquiries/view/?id=${it.id}`)}>
                  <td className="date">{fmtDateTime(it.createdAt)}</td>
                  <td><Link href={`/admin/inquiries/view/?id=${it.id}`} onClick={(e) => e.stopPropagation()}><b>{it.name}</b></Link></td>
                  <td>{it.phone}</td>
                  <td>{it.department}</td>
                  <td>{it.region}</td>
                  <td>{it.consultType}</td>
                  <td><span className={`chip st-${it.status}`}>{INQUIRY_STATUS_LABEL[it.status]}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
