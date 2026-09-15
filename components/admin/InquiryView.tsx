"use client";

/** 관리자 상담 문의 상세: 접수 항목 전체 + 처리 상태 · 내부 메모 저장 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { INQUIRY_STATUS_LABEL, fmtDateTime, type Inquiry, type InquiryStatus } from "./types";

export default function InquiryView() {
  const id = Number(useSearchParams().get("id")) || 0;
  const [item, setItem] = useState<Inquiry | null>(null);
  const [status, setStatus] = useState<InquiryStatus>("new");
  const [memo, setMemo] = useState("");
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api<{ item: Inquiry }>(`admin/inquiry.php?id=${id}`)
      .then((r) => { setItem(r.item); setStatus(r.item.status); setMemo(r.item.memo ?? ""); })
      .catch((e: Error) => setMsg({ type: "error", text: e.message }));
  }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      await api("admin/inquiry-update.php", { body: { id, status, memo } });
      setMsg({ type: "success", text: "저장했습니다." });
      setItem((it) => (it ? { ...it, status, memo } : it));
    } catch (e) {
      setMsg({ type: "error", text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  if (!id) return <div className="mr-flash error">문의 번호가 없습니다.</div>;
  if (!item) return <div className="adm-loading">{msg?.text ?? "불러오는 중…"}</div>;

  const rows: [string, React.ReactNode][] = [
    ["접수일시", fmtDateTime(item.createdAt)],
    ["성함", item.name],
    ["연락처", <a key="tel" href={`tel:${item.phone}`}>{item.phone}</a>],
    ["이메일", <a key="mail" href={`mailto:${item.email}`}>{item.email}</a>],
    ["진료과목", item.department],
    ["희망 지역", item.region],
    ["예정 시기", item.openTiming],
    ["자금 규모", item.budget],
    ["보증금", item.deposit],
    ["임대료", item.rent],
    ["시설비", item.facilityCost],
    ["예상 연면적", item.area],
    ["시설 유무", item.facility],
    ["상담유형", item.consultType],
  ];

  return (
    <div className="adm-view">
      <div className="adm-head">
        <div><h3>상담 문의 #{item.id}</h3><p>{item.name} · {item.consultType}</p></div>
        <div className="btns"><Link className="mr-btn line" href="/admin/inquiries/">목록으로</Link></div>
      </div>
      {msg ? <div className={`mr-flash ${msg.type}`} role="status">{msg.text}</div> : null}
      <div className="adm-view-grid">
        <div className="adm-panel">
          <h4>접수 내용</h4>
          <table className="adm-dl"><tbody>{rows.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v || <span className="none">-</span>}</td></tr>)}</tbody></table>
          <h4 className="mt">문의내용</h4>
          <p className="msg">{item.message || "(입력 없음)"}</p>
        </div>
        <div className="adm-panel">
          <h4>처리</h4>
          <div className="seg">
            {(["new", "in_progress", "done"] as InquiryStatus[]).map((s) => (
              <button key={s} type="button" className={status === s ? "on" : ""} onClick={() => setStatus(s)}>{INQUIRY_STATUS_LABEL[s]}</button>
            ))}
          </div>
          <label className="lbl" htmlFor="iv-memo">내부 메모</label>
          <textarea id="iv-memo" value={memo} onChange={(e) => setMemo(e.target.value)} rows={8} maxLength={3000} placeholder="통화 내용, 다음 연락 일정 등 (고객에게 보이지 않습니다)" />
          <button type="button" className="mr-btn" onClick={save} disabled={saving}>{saving ? "저장 중…" : "저장"}</button>
        </div>
      </div>
    </div>
  );
}
