"use client";

/**
 * 오시는 길 / 회사소개 지도.
 *  - 실제 주소가 있으면 Google 지도 embed
 *  - 주소가 자리표시(00구)면 Leaflet(OpenStreetMap)으로 서울 시내 기본 위치를 표시
 */
import dynamic from "next/dynamic";

const OsmMap = dynamic(() => import("./OsmMap"), { ssr: false, loading: () => <div style={{ height: "100%", background: "#eef2f5" }} /> });

export default function PlaceMap({ address, real, label }: { address: string; real: boolean; label: string }) {
  if (real) {
    return <iframe src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed&hl=ko`} width="100%" height="100%" style={{ border: 0, display: "block" }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="오시는 길 지도" />;
  }
  return <OsmMap label={label} address={address} />;
}
