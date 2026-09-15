import { Suspense } from "react";
import ListingDetail from "@/components/listings/ListingDetail";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/location/view", { title: "매물 상세" }, { noindex: true });

/** 매물 상세 (/location/view/?code=L-2026-001). 회원 전용 — 서버 게이트 + 브라우저에서 API 로 불러온다. */
export default function ListingViewPage() {
  return <Suspense fallback={null}><ListingDetail /></Suspense>;
}
