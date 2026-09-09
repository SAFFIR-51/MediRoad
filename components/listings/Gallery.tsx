"use client";

import { useState } from "react";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [cur, setCur] = useState(0);
  const list = images.length ? images : ["/brand/og.png"];
  return (
    <div className="mr-gallery aos">
      <div className="main"><img src={list[cur]} alt={title} /></div>
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
