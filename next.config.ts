import type { NextConfig } from "next";

/**
 * 카페24 웹호스팅(PHP) 배포: 화면은 정적 HTML(out/)로 내보내고,
 * 로그인·관리자·매물·상담 문의는 PHP API(/api)와 router.php 가 처리한다. (docs/카페24_배포_가이드.md)
 * 정적 내보내기에서는 서버 액션·proxy·rewrites·redirects·동적 경로(generateStaticParams 없는)를 쓸 수 없다.
 *
 * Vercel 서버 모드(Next 서버 라우트 + Postgres)로 만들었던 코드는 커밋 933d102 에 남아 있다.
 */
const nextConfig: NextConfig = {
  output: "export",
  // /about → /about/index.html 로 내보내 Apache 디렉터리 구조와 맞춘다
  trailingSlash: true,
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.200.107"],
};

export default nextConfig;
