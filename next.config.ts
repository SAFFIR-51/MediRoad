import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 서버를 localhost 외 주소(127.0.0.1, 사내 IP)로 열 때 HMR 차단 방지
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.200.107"],
  // libsql 네이티브 바인딩은 서버 번들에서 제외
  serverExternalPackages: ["@libsql/client", "libsql"],
  poweredByHeader: false,
};

export default nextConfig;
