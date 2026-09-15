"use client";

import { useEffect, useState } from "react";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [cur, setCur] = useState(0);
  const list = images.length ? images : ["/brand/og.png"];
  useEffect(() => { setCur(0); }, [images]);
  return (
    <div className="mr-gallery">
      <div className="main">
        <img src={list[cur]} alt={`${title} 사진 ${cur + 1}`} />
        {list.length > 1 ? <span className="count">{cur + 1} / {list.length}</span> : null}
      </div>
      {list.length > 1 && (
        <div className="thumbs">
          {list.map((src, i) => (
            <button type="button" key={src + i} className={i === cur ? "on" : ""} onClick={() => setCur(i)} aria-label={`사진 ${i + 1}`}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
