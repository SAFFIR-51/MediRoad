"use client";

import { useActionState } from "react";
import { savePopupAction } from "@/app/actions/admin";
import type { Popup } from "@/lib/db/schema";

export default function PopupForm({ p, onDone }: { p: Popup | null; onDone?: () => void }) {
  const [state, action, pending] = useActionState(savePopupAction, null);
  return (
    <form action={action} className="mr-form wide" style={{ margin: 0, maxWidth: "none", paddingTop: 20 }} encType="multipart/form-data">
      {state?.message && <div className={`mr-flash ${state.ok ? "success" : "error"}`}>{state.message}</div>}
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="grid2">
        <div className="row"><label>제목<i>*</i></label><input type="text" name="title" defaultValue={p?.title ?? ""} required /></div>
        <div className="row"><label>링크 (선택)</label><input type="text" name="link" defaultValue={p?.link ?? ""} placeholder="/location 또는 https://..." /></div>
      </div>
      <div className="row"><label>내용 (선택)</label><textarea name="content" defaultValue={p?.content ?? ""} style={{ height: 120 }} /></div>
      <div className="row">
        <label>이미지 (선택, 세로형 권장)</label>
        <input type="file" name="image" accept="image/*" />
        {p?.image && <div className="help">현재 이미지: <a href={p.image} target="_blank" style={{ color: "var(--gold)" }}>보기</a><input type="hidden" name="keep_image" value={p.image} /><label style={{ display: "inline", marginLeft: 12 }}><input type="checkbox" name="remove_image" /> 삭제</label></div>}
      </div>
      <div className="grid2">
        <div className="row"><label>게시 시작일</label><input type="date" name="start_at" defaultValue={p?.startAt ?? ""} /></div>
        <div className="row"><label>게시 종료일</label><input type="date" name="end_at" defaultValue={p?.endAt ?? ""} /></div>
      </div>
      <div className="row check"><input type="checkbox" name="is_active" id={`active-${p?.id ?? "new"}`} defaultChecked={p ? !!p.isActive : true} /><label htmlFor={`active-${p?.id ?? "new"}`}>게시</label></div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn" type="submit" disabled={pending}>{p ? "수정 저장" : "팝업 등록"}</button>
        {onDone && <button type="button" className="mr-btn line" onClick={onDone}>취소</button>}
      </div>
    </form>
  );
}
