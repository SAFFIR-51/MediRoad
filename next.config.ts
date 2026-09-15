import type { NextConfig } from "next";

/**
 * 카페24 웹호스팅(PHP) 배포: 화면은 정적 HTML(out/)로 내보내고,
 * 로그인·관리자·매물·상담 문의는 PHP API(/api)와 router.php 가 처리한다. (docs/개편_사양.md)
 * 정적 내보내기에서는 서버 액션·proxy·rewrites·redirects·동적 경로(generateStaticParams 없는)를 쓸 수 없다.
 */
const nextConfig: NextConfig = {
  output: "export",
  // /about → /about/index.html 로 내보내 Apache 디렉터리 구조와 맞춘다
  trailingSlash: true,
  images: { unoptimized: true },
  // 개발 서버를 localhost 외 주소(127.0.0.1, 사내 IP)로 열 때 HMR 차단 방지
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.200.107"],
};

export default nextConfig;
