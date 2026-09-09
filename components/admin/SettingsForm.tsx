"use client";

import { useActionState } from "react";
import { saveSettingsAction, adminChangePasswordAction } from "@/app/actions/admin";

export default function SettingsForm({ gate, mailTo, adminId, mustChange }: { gate: string; mailTo: string; adminId: string; mustChange: boolean }) {
  const [s1, a1, p1] = useActionState(saveSettingsAction, null);
  const [s2, a2, p2] = useActionState(adminChangePasswordAction, null);
  return (
    <>
      <form action={a1} className="mr-form wide" style={{ margin: 0, maxWidth: "none" }}>
        {s1?.message && <div className={`mr-flash ${s1.ok ? "success" : "error"}`}>{s1.message}</div>}
        <div className="row"><label>매물 열람 정책</label>
          <select name="listing_gate" defaultValue={gate}>
            <option value="detail">목록은 공개, 상세(주소·조건·사진)는 회원만</option>
            <option value="all">목록·상세 모두 회원만</option>
            <option value="none">전체 공개</option>
          </select>
        </div>
        <div className="row"><label>상담 접수 알림 메일</label><input type="email" name="mail_to" defaultValue={mailTo} placeholder="비우면 저장만 하고 메일은 보내지 않습니다" /><div className="help">발송에는 .env 의 SMTP 설정이 필요합니다.</div></div>
        <button className="btn" type="submit" disabled={p1}>저장</button>
      </form>
      <div className="mr-subhead"><span>관리자 비밀번호 변경 ({adminId})</span></div>
      {mustChange && <div className="mr-flash">초기 비밀번호를 사용 중입니다. 지금 변경해 주세요.</div>}
      <form action={a2} className="mr-form wide" style={{ margin: 0, maxWidth: "none", border: 0, paddingTop: 20 }}>
        {s2?.message && <div className={`mr-flash ${s2.ok ? "success" : "error"}`}>{s2.message}</div>}
        <div className="grid2">
          <div className="row"><label>새 비밀번호</label><input type="password" name="password" required autoComplete="new-password" /></div>
          <div className="row"><label>새 비밀번호 확인</label><input type="password" name="password2" required autoComplete="new-password" /></div>
        </div>
        <button className="btn" type="submit" disabled={p2}>비밀번호 변경</button>
      </form>
    </>
  );
}
