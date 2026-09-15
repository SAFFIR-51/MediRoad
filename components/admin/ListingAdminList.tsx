"use client";

/**
 * 관리자 매물 목록: 상태 탭 · 거래형태 · 검색, 행마다 노출/거래완료/비노출 즉시 전환, 수정 · 삭제, 예시 매물 일괄 삭제.
 * 계약이 끝난 매물은 통보받은 날부터 3일 안에 내려야 하므로(공인중개사법) 상태 전환을 목록에서 한 번에 할 수 있게 둔다.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { DEAL_TYPES, STATUS_LABEL, fmtDate, priceMain, listingUrl, type Listing, type ListingStatus } from "@/lib/listing-utils";

const STATUS_TABS: ("" | ListingStatus)[] = ["", "open", "closed", "hidden"];

export default function ListingAdminList() {
  const sp = useSearchParams();
  const [status, setStatus] = useState<"" | ListingStatus>((sp.get("status") as ListingStatus) || "");
  const [dealType, setDealType] = useState("");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Listing[] | null>(null);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState<number | "samples" | null>(null);

  const load = useCallback(() => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (dealType) p.set("dealType", dealType);
    if (q.trim()) p.set("q", q.trim());
    api<{ items: Listing[] }>(`admin/listings.php?${p}`)
      .then((r) => setItems(r.items))
      .catch((e: Error) => setMsg({ type: "error", text: e.message }));
  }, [status, dealType, q]);

  useEffect(() => { load(); }, [status, dealType]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeStatus = async (l: Listing, next: ListingStatus) => {
    if (l.status === next) return;
    setBusy(l.id);
    try {
      await api("admin/listing-status.php", { body: { id: l.id, status: next } });
      setMsg({ type: "success", text: `[${l.code}] ${STATUS_LABEL[next]}(으)로 변경했습니다.` });
      load();
    } catch (e) {
      setMsg({ type: "error", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const remove = async (l: Listing) => {
    if (!window.confirm(`[${l.code}] ${l.title}\n매물과 업로드한 사진을 삭제합니다. 되돌릴 수 없습니다.`)) return;
    setBusy(l.id);
    try {
      await api("admin/listing-delete.php", { body: { id: l.id } });
      setMsg({ type: "success", text: `[${l.code}] 삭제했습니다.` });
      load();
    } catch (e) {
      setMsg({ type: "error", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const samples = items?.filter((l) => l.isSample).length ?? 0;
  const removeSamples = async () => {
    if (!window.confirm("예시 매물을 모두 삭제합니다. 실제로 등록한 매물은 지워지지 않습니다. 계속할까요?")) return;
    setBusy("samples");
    try {
      const r = await api<{ deleted: number }>("admin/listings-delete-samples.php", { body: {} });
      setMsg({ type: "success", text: `예시 매물 ${r.deleted}건을 삭제했습니다.` });
      load();
    } catch (e) {
      setMsg({ type: "error", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="adm-list">
      <div className="adm-head">
        <div>
          <h3>매물 관리</h3>
          <p>계약이 끝난 매물은 통보받은 날부터 <b>3일 안에</b> [거래완료]로 바꿔 주세요. 거래완료·비노출 매물은 회원 화면에서 바로 사라집니다.</p>
        </div>
        <div className="btns">
          {samples > 0 && status === "" && !dealType && !q ? (
            <button type="button" className="mr-btn line sm danger" onClick={removeSamples} disabled={busy === "samples"}>예시 매물 전체 삭제 ({samples}건)</button>
          ) : null}
          <Link className="mr-btn" href="/admin/listings/edit/">매물 등록</Link>
        </div>
      </div>

      {msg ? <div className={`mr-flash ${msg.type}`} role="status">{msg.text}</div> : null}

      <div className="adm-filter">
        <div className="seg">
          {STATUS_TABS.map((s) => (
            <button key={s || "all"} type="button" className={status === s ? "on" : ""} onClick={() => setStatus(s)}>{s ? STATUS_LABEL[s] : "전체"}</button>
          ))}
        </div>
        <select value={dealType} onChange={(e) => setDealType(e.target.value)} aria-label="거래형태">
          <option value="">거래형태 전체</option>
          {DEAL_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="search">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="매물번호 · 제목 · 지역 · 주소 검색" />
          <button type="submit" aria-label="검색"><i className="xi-search"></i></button>
        </form>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr><th>사진</th><th>매물번호</th><th>매물</th><th>가격</th><th>상태</th><th>수정일</th><th>관리</th></tr>
          </thead>
          <tbody>
            {items === null ? (
              <tr><td colSpan={7} className="empty">불러오는 중…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="empty">조건에 맞는 매물이 없습니다.</td></tr>
            ) : (
              items.map((l) => {
                const p = priceMain(l);
                return (
                  <tr key={l.id} className={l.status !== "open" ? "dim" : ""}>
                    <td className="thumb">{l.images[0] ? <img src={l.images[0]} alt="" /> : <span />}</td>
                    <td className="code">{l.code}{l.isSample ? <em className="chip sample">예시</em> : null}</td>
                    <td className="ttl">
                      <b>{l.title}</b>
                      <small>{l.dealType} · {l.category} · {l.region}</small>
                    </td>
                    <td className="price"><small>{p.label}</small>{p.value}</td>
                    <td>
                      <div className="seg sm">
                        {(["open", "closed", "hidden"] as ListingStatus[]).map((s) => (
                          <button key={s} type="button" className={`${s}${l.status === s ? " on" : ""}`} disabled={busy === l.id} onClick={() => changeStatus(l, s)}>{STATUS_LABEL[s]}</button>
                        ))}
                      </div>
                      {l.status === "closed" && l.closedAt ? <small className="closed-at">거래완료 {fmtDate(l.closedAt)}</small> : null}
                    </td>
                    <td className="date">{fmtDate(l.updatedAt)}</td>
                    <td className="act">
                      <Link href={`/admin/listings/edit/?id=${l.id}`}>수정</Link>
                      {l.status === "open" ? <a href={listingUrl(l.code)} target="_blank" rel="noopener">보기</a> : null}
                      <button type="button" className="danger" onClick={() => remove(l)} disabled={busy === l.id}>삭제</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
