import Link from "next/link";
import type { Metadata } from "next";
import MarketingRedirect from "./redirect";

// 이동 안내용 빈 페이지: 실제 페이지의 SEO 문구를 물려받지 않는다.
// canonical 을 이동할 주소로 두어 검색엔진이 새 주소를 대표 페이지로 보게 한다 (noindex 와 함께 쓰면 신호가 엇갈림).
export const metadata: Metadata = {
  title: "페이지 이동",
  alternates: { canonical: "/partners/marketing/" },
};

// 정적 파일 호스팅·개발 서버에서도 이전 북마크를 사용할 수 있게 한다.
// 운영 서버의 HTTP 리다이렉트는 vercel.json과 server/router.php에서 처리한다.
export default function LegacyMarketingPage() {
  return <section className="sub_con"><div className="wrap">
    <MarketingRedirect />
    <h2>온오프라인 마케팅 페이지로 이동합니다</h2>
    <Link href="/partners/marketing/">페이지 바로가기</Link>
  </div></section>;
}
