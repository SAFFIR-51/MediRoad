"use client";

/** 홈 오픈 팝업: /api/popup 에서 게시 중인 팝업을 받아 표시. '오늘 하루 보지 않기'는 쿠키(mr_popup_hide). */
import { useEffect, useState } from "react";

type Item = { id: number; title: string; content: string | null; image: string | null; link: string | null };

function hiddenIds(): string[] {
  const m = document.cookie.match(/(?:^|; )mr_popup_hide=([^;]*)/);
  return m ? decodeURIComponent(m[1]).split(",").filter(Boolean) : [];
}

export default function OpenPopup() {
  const [items, setItems] = useState<Item[]>([]);
  const [today, setToday] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("/api/popup", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items: Item[] }) => {
        const hide = hiddenIds();
        setItems((d.items || []).filter((p) => !hide.includes(String(p.id))));
      })
      .catch(() => {});
  }, []);

  if (!items.length) return null;

  const close = (p: Item) => {
    if (today[p.id]) {
      const ids = [...hiddenIds(), String(p.id)];
      document.cookie = `mr_popup_hide=${encodeURIComponent(ids.join(","))};path=/;max-age=86400`;
    }
    setItems((list) => list.filter((x) => x.id !== p.id));
  };

  return (
    <div className="mr-popup-wrap">
      {items.map((p) => {
        const inner = (
          <>
            {p.image && <img src={p.image} alt="" />}
            {p.content && <div className="txt">{p.content.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}</div>}
          </>
        );
        return (
          <div className="mr-popup" key={p.id}>
            <div className="head"><b>{p.title}</b><button type="button" className="x" aria-label="닫기" onClick={() => close(p)}>&times;</button></div>
            <div className="body">{p.link ? <a href={p.link}>{inner}</a> : inner}</div>
            <div className="foot">
              <label><input type="checkbox" checked={!!today[p.id]} onChange={(e) => setToday({ ...today, [p.id]: e.target.checked })} /> 오늘 하루 보지 않기</label>
              <button type="button" className="x" onClick={() => close(p)}>닫기</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
