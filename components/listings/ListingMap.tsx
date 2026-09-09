"use client";

/** Leaflet + OpenStreetMap 매물 지도 (API 키 불필요) */
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Listing } from "@/lib/listing-utils";
import { listingUrl } from "@/lib/listing-utils";

export default function ListingMap({ items }: { items: Listing[] }) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { scrollWheelZoom: false }).setView([36.6, 127.6], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "&copy; OpenStreetMap" }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current, layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const pts: [number, number][] = [];
    const pin = (t: string) => L.divIcon({ className: `mr-pin ${t}`, html: "<span></span>", iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -26] });
    items.forEach((l) => {
      if (l.lat == null || l.lng == null) return;
      pts.push([l.lat, l.lng]);
      const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
      L.marker([l.lat, l.lng], { icon: pin(l.type) }).addTo(layer).bindPopup(`<b>${esc(l.title)}</b><br>${esc(l.region)}<br><a href="${listingUrl(l.code)}">자세히 보기 →</a>`);
    });
    if (pts.length) map.fitBounds(pts, { padding: [40, 40], maxZoom: 12 });
  }, [items]);

  return <div className="mr-map" ref={elRef} />;
}
