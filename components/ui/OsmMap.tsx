"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/** 주소 확정 전 기본 위치(서울시청 인근)를 표시하는 지도 */
const DEFAULT: [number, number] = [37.5665, 126.978];

export default function OsmMap({ label, address, center = DEFAULT }: { label: string; address: string; center?: [number, number] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView(center, 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "&copy; OpenStreetMap" }).addTo(map);
    const icon = L.divIcon({ className: "mr-pin", html: "<span></span>", iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -26] });
    L.marker(center, { icon }).addTo(map).bindPopup(`<b>${label}</b><br>${address}`).openPopup();
    return () => { map.remove(); };
  }, [label, address, center]);
  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}
