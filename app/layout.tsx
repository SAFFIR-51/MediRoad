import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/lib/site";
import { seoGlobal, siteUrl } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import QuickNav from "@/components/layout/QuickNav";
import CtaBand from "@/components/layout/CtaBand";
import ScrollEffects from "@/components/effects/ScrollEffects";
import BodyClass from "@/components/effects/BodyClass";
import JsonLd from "@/components/seo/JsonLd";

const verification = (site as { seo?: { verification?: { google?: string; naver?: string } } }).seo?.verification ?? {};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: seoGlobal.title, template: `%s | ${site.brand.name}` },
  description: seoGlobal.description,
  keywords: seoGlobal.keywords,
  icons: { icon: site.brand.logo.favicon, apple: site.brand.logo.favicon },
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "ko_KR", siteName: site.brand.title, title: seoGlobal.title, description: seoGlobal.description, url: "/", images: [{ url: site.brand.logo.og, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  // 서치콘솔·서치어드바이저 소유 확인: site.config.json seo.verification 에 값을 넣으면 출력된다
  verification: {
    ...(verification.google ? { google: verification.google } : {}),
    ...(verification.naver ? { other: { "naver-site-verification": verification.naver } } : {}),
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1 };

/** 네이버·구글 업체 정보 (주소·전화). 좌표는 확인된 값이 없어 넣지 않는다. */
const business = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.brand.name,
  alternateName: site.brand.nameEn,
  legalName: site.company.name,
  description: seoGlobal.description,
  url: `${siteUrl}/`,
  logo: `${siteUrl}${site.brand.logo.color}`,
  image: `${siteUrl}${site.brand.logo.og}`,
  telephone: site.company.tel,
  email: site.company.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "마곡중앙6로 42, 11층 1122호 (마곡동, 사이언스타)",
    addressLocality: "강서구",
    addressRegion: "서울특별시",
    addressCountry: "KR",
  },
  areaServed: [{ "@type": "AdministrativeArea", name: "서울특별시" }, { "@type": "AdministrativeArea", name: "경기도" }, { "@type": "AdministrativeArea", name: "인천광역시" }],
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-auth · data-loc 속성은 카페24 서버(router.php)가 응답할 때 넣는다
    <html lang="ko" suppressHydrationWarning>
      <body>
        <JsonLd data={business} />
        <BodyClass />
        <Header />
        {children}
        <CtaBand />
        <QuickNav />
        <Footer />
        <ScrollEffects />
      </body>
    </html>
  );
}
