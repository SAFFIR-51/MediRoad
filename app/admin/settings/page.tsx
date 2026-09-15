"use client";

/** 관리자 설정: 헤더 "매물 정보" 메뉴 노출 / 미노출 */
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminSettingsPage() {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ settings: { locationMenuVisible: boolean } }>("settings.php")
      .then((r) => setVisible(r.settings.locationMenuVisible))
      .catch((e: Error) => setMsg({ type: "error", text: e.message }));
  }, []);

  const save = async (next: boolean) => {
    setSaving(true);
    try {
      await api("admin/settings.php", { body: { locationMenuVisible: next } });
      setVisible(next);
      document.documentElement.dataset.loc = next ? "on" : "off";
      setMsg({ type: "success", text: next ? "매물 정보 메뉴를 노출했습니다." : "매물 정보 메뉴를 숨겼습니다." });
    } catch (e) {
      setMsg({ type: "error", text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-settings">
      <div className="adm-head"><div><h3>설정</h3><p>사이트 전체에 바로 반영됩니다.</p></div></div>
      {msg ? <div className={`mr-flash ${msg.type}`} role="status">{msg.text}</div> : null}
      <div className="adm-panel setting">
        <div className="txt">
          <h4>매물 정보 메뉴 노출</h4>
          <p>미노출로 바꾸면 PC·모바일 헤더의 매물 정보 메뉴, 퀵메뉴, 홈의 매물 섹션 등 매물로 연결되는 버튼·링크가 모두 숨겨집니다.</p>
          <p>미노출 상태에서 매물 주소로 직접 들어오면 <b>홈으로 이동</b>합니다. 관리자는 확인을 위해 계속 볼 수 있습니다.</p>
        </div>
        <button type="button" role="switch" aria-checked={!!visible} className={`adm-switch${visible ? " on" : ""}`} disabled={visible === null || saving} onClick={() => save(!visible)}>
          <span className="knob" />
          <b>{visible === null ? "확인 중" : visible ? "노출" : "미노출"}</b>
        </button>
      </div>
    </div>
  );
}
