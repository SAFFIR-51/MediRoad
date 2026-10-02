import type { NextConfig } from "next";

/**
 * Vercel 배포 (서버 모드).
 * 로그인·회원가입·매물·상담 문의는 Next 서버 라우트(app/api/*)와 proxy.ts 가 처리하고,
 * 데이터는 Postgres(DATABASE_URL 또는 POSTGRES_URL)에 저장한다.
 * DB 가 연결되지 않은 동안에는 매물 정보가 데모 데이터로 공개 표시된다 (lib/server/listings.ts).
 *
 * 카페24(PHP) 배포용 정적 내보내기 설정은 더 이상 기본값이 아니다.
 * 그 구조로 되돌리려면 output: "export" 를 켜고 server/ 의 PHP 백엔드를 쓰면 된다 (docs/카페24_배포_가이드.md).
 */
const nextConfig: NextConfig = {
  // 주소 형태를 기존과 같게 유지한다 (/about → /about/)
  trailingSlash: true,
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.200.107"],
};

export default nextConfig;
