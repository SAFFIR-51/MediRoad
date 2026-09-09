"use client";

/**
 * 홈 전문가 그룹 도넛 (원본 createDonut 스크립트 이식)
 * SVG 링을 8개 섹터로 나눠 사진을 클립하고, hover 시 해당 자문 패널(.item-pop)을 표시한다.
 */
import { useEffect, useRef } from "react";
import Link from "next/link";
import { site } from "@/lib/site";
import { Lines } from "@/components/ui/Text";

const NS = "http://www.w3.org/2000/svg";
const XL = "http://www.w3.org/1999/xlink";

function polar(cx: number, cy: number, r: number, a: number) { return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; }
function ringSectorPath(cx: number, cy: number, rInner: number, rOuter: number, a0: number, a1: number) {
  const p1 = polar(cx, cy, rOuter, a0), p2 = polar(cx, cy, rOuter, a1), p3 = polar(cx, cy, rInner, a1), p4 = polar(cx, cy, rInner, a0);
  const large = (a1 - a0) % (2 * Math.PI) > Math.PI ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${large} 0 ${p4.x} ${p4.y} Z`;
}

export default function ExpertSection() {
  const ex = site.home.expert;
  const svgRef = useRef<SVGSVGElement>(null);
  const contRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = svgRef.current, cont = contRef.current;
    if (!svg || !cont) return;
    const defs = svg.querySelector("#defs")!, g = svg.querySelector("#slices")!;
    let imgLayer = svg.querySelector("#imgs");
    if (!imgLayer) { imgLayer = document.createElementNS(NS, "g"); imgLayer.setAttribute("id", "imgs"); svg.insertBefore(imgLayer, g); }
    defs.innerHTML = ""; imgLayer.innerHTML = ""; g.innerHTML = "";

    const data = ex.items;
    const N = data.length, vb = svg.viewBox.baseVal;
    const cx = vb.width / 2, cy = vb.height / 2, R = Math.min(vb.width, vb.height) / 2 * 0.95, r = R * 0.45;
    const start0 = (-67.5 * Math.PI) / 180, step = (2 * Math.PI) / N;
    const cleanups: (() => void)[] = [];

    for (let i = 0; i < N; i++) {
      const a0 = start0 + i * step, a1 = start0 + (i + 1) * step;
      const path = document.createElementNS(NS, "path");
      path.setAttribute("class", "slice"); path.setAttribute("d", ringSectorPath(cx, cy, r, R, a0, a1));
      path.setAttribute("tabindex", "0"); path.setAttribute("data-idx", String(i));
      path.setAttribute("fill", "rgba(0,0,0,0.001)"); path.setAttribute("stroke", "none");
      const t = document.createElementNS(NS, "title"); t.textContent = data[i].label; path.appendChild(t);
      g.appendChild(path);

      const bbox = (path as SVGPathElement).getBBox();
      const cp = document.createElementNS(NS, "clipPath"); cp.setAttribute("id", `cp_${i}`);
      const cpPath = document.createElementNS(NS, "path"); cpPath.setAttribute("d", path.getAttribute("d")!); cp.appendChild(cpPath); defs.appendChild(cp);

      const img = document.createElementNS(NS, "image");
      img.setAttributeNS(XL, "href", data[i].img);
      const zoom = 1.5, w = bbox.width * zoom, h = bbox.height * zoom;
      img.setAttribute("x", String(bbox.x + (bbox.width - w) / 2)); img.setAttribute("y", String(bbox.y + (bbox.height - h) / 2));
      img.setAttribute("width", String(w)); img.setAttribute("height", String(h));
      img.setAttribute("preserveAspectRatio", "xMidYMid meet"); img.setAttribute("clip-path", `url(#cp_${i})`);
      img.setAttribute("class", "slice-img"); img.setAttribute("style", "pointer-events:none");
      imgLayer.appendChild(img);

      const panel = cont.querySelector<HTMLElement>(`.slice-wrap[data-idx="${i}"] .item-pop`);
      const on = () => { img.classList.add("on"); cont.querySelectorAll(".item-pop.on").forEach((el) => el.classList.remove("on")); panel?.classList.add("on"); };
      const off = () => { img.classList.remove("on"); panel?.classList.remove("on"); };
      path.addEventListener("mouseenter", on); path.addEventListener("mouseleave", off);
      path.addEventListener("focus", on); path.addEventListener("blur", off);
      const pOn = () => panel?.classList.add("on"), pOff = () => panel?.classList.remove("on");
      panel?.addEventListener("mouseenter", pOn); panel?.addEventListener("mouseleave", pOff);
      cleanups.push(() => { panel?.removeEventListener("mouseenter", pOn); panel?.removeEventListener("mouseleave", pOff); });
    }
    return () => cleanups.forEach((f) => f());
  }, [ex.items]);

  return (
    <section className="main_con sec_expert">
      <div className="tt taC">
        <h3><span><b>{ex.title}</b></span></h3>
        <h4>[ {ex.en} ]</h4>
        <p>{ex.desc}</p>
      </div>
      <div className="con aos">
        <div className="donut-wrap">
          <svg id="donut" ref={svgRef} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-label="전문가 그룹">
            <defs id="defs"></defs>
            <g id="slices"></g>
          </svg>
        </div>
        <div className="cont" ref={contRef}>
          {ex.items.map((it, i) => (
            <div className="slice-wrap" data-idx={i} key={it.label}>
              <div id={`item${i + 1}`} className="item-pop">
                <Link href={it.href}>
                  <dl>
                    <dt>[ {it.label} ]</dt>
                    <dd><Lines lines={it.en} /></dd>
                  </dl>
                  <span>Go<img src="/images/icons/arrow-white.svg" alt="" /></span>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="box">
          <div>
            <div className="txt">
              <h5>{ex.box.h.map((l, i) => <span key={i} dangerouslySetInnerHTML={{ __html: l + (i < ex.box.h.length - 1 ? (i === 0 ? '<br class="m">' : "<br>") : "") }} />)}</h5>
              <p><Lines lines={ex.box.p} /></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
