"use client";

import { Fragment, useState } from "react";
import PopupForm from "./PopupForm";
import { deletePopupAction } from "@/app/actions/admin";
import type { Popup } from "@/lib/db/schema";

export default function PopupList({ rows }: { rows: Popup[] }) {
  const [editing, setEditing] = useState<number | null>(null);
  return (
    <table className="mr-table">
      <thead><tr><th>제목</th><th>게시 기간</th><th>상태</th><th>등록일</th><th>관리</th></tr></thead>
      <tbody>
        {rows.length === 0 ? <tr><td colSpan={5} className="empty">등록된 팝업이 없습니다.</td></tr> : rows.map((p) => (
          <Fragment key={p.id}>
            <tr>
              <td>{p.title}{p.image ? <i className="xi-image-o" style={{ marginLeft: 6, color: "#999" }}></i> : null}</td>
              <td>{p.startAt || "-"} ~ {p.endAt || "-"}</td>
              <td>{p.isActive ? "게시" : "중지"}</td>
              <td>{p.createdAt.slice(0, 10)}</td>
              <td><div className="acts">
                <button className="mr-btn sm line" type="button" onClick={() => setEditing(editing === p.id ? null : p.id)}>{editing === p.id ? "닫기" : "수정"}</button>
                <form action={deletePopupAction}><input type="hidden" name="id" value={p.id} /><button className="mr-btn sm danger" type="submit">삭제</button></form>
              </div></td>
            </tr>
            {editing === p.id && <tr><td colSpan={5} style={{ whiteSpace: "normal" }}><PopupForm p={p} onDone={() => setEditing(null)} /></td></tr>}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}
