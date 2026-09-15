import { Suspense } from "react";
import SubTop from "@/components/layout/SubTop";
import LocationList from "@/components/listings/LocationList";
import { subtopFor } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/location", { title: "매물 정보" }, { noindex: true });

/**
 * 매물 정보 목록 (회원 전용). 서버(router.php)가 비로그인·미노출을 먼저 걸러내고,
 * 목록은 브라우저에서 /api/listings.php 로 불러온다 (HTML 에는 매물 데이터가 들어가지 않는다).
 */
export default function LocationPage() {
  const top = subtopFor("/location", {});
  return (
    <>
      <SubTop {...top} visual={top.visual || "competition"} bg="location" />
      <Suspense fallback={null}><LocationList /></Suspense>
    </>
  );
}
