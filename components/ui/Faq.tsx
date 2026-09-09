"use client";

import { useState } from "react";

export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mr-faq aos">
      {items.map((f, i) => (
        <div className={`q${open === i ? " open" : ""}`} key={f.q}>
          <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            <span>Q. {f.q}</span><i className="xi-angle-down"></i>
          </button>
          <div className="a">{f.a}</div>
        </div>
      ))}
    </div>
  );
}
