import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site, services, serviceHref, GROUPS } from "@/lib/site";
import { seoGlobal, siteUrl } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import QuickNav from "@/components/layout/QuickNav";
import CtaBand from "@/components/layout/CtaBand";
import ScrollEffects from "@/components/effects/ScrollEffects";
import BodyClass from "@/components/effects/BodyClass";
import JsonLd from "@/components/seo/JsonLd";
import { ORG_ID, WEBSITE_ID } from "@/lib/aeo";

const verification = (site as { seo?: { verification?: { google?: string; naver?: string } } }).seo?.verification ?? {};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: seoGlobal.title, template: `%s | ${site.brand.name}` },
  description: seoGlobal.description,
  keywords: seoGlobal.keywords,
  // 구글 검색 결과 아이콘은 48px 배수 정사각형을 요구한다
  icons: {
    icon: [
      { url: "/brand/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/brand/apple-touch-icon.png", sizes: "180x180" },
  },
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "ko_KR", siteName: site.brand.title, title: seoGlobal.title, description: seoGlobal.description, url: "/", images: [{ url: site.brand.logo.og, width: 1200, height: 630, alt: site.brand.title }] },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  // 서치콘솔·서치어드바이저 소유 확인: site.config.json seo.verification 에 값을 넣으면 출력된다
  verification: {
    ...(verification.google ? { google: verification.google } : {}),
    ...(verification.naver ? { other: { "naver-site-verification": verification.naver } } : {}),
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1 };

/**
 * 네이버·구글 업체 정보 + AI 답변엔진용 사업자 엔티티. 좌표는 확인된 값이 없어 넣지 않는다.
 * 다른 스키마(Service.provider · WebSite.publisher)는 @id 로 이 항목을 가리킨다.
 * 공식 SNS·블로그는 운영하지 않아 sameAs 는 비워 둔다 (site.config.json contact._comment).
 */
const business = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": ORG_ID,
  name: site.brand.name,
  alternateName: [site.brand.title, "메디로드 개원컨설팅", "메디로드개원컨설팅", site.brand.nameEn],
  legalName: site.company.name,
  description: seoGlobal.description,
  url: `${siteUrl}/`,
  logo: `${siteUrl}${site.brand.logo.icon}`,
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
  founder: { "@type": "Person", name: site.company.ceo, jobTitle: "대표" },
  taxID: site.company.bizNo,
  knowsAbout: ["병원 개원 입지 분석", "의원 개원 입지 선정", "약국 개국 입지 분석", "병원 양수·양도", "상권 분석", "의료기관 개설신고·개설허가", "병·의원 개원 준비", "병원 폐업 정리"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "메디로드 서비스",
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      category: GROUPS[s.group].title,
      itemOffered: { "@type": "Service", name: s.title, url: `${siteUrl}${serviceHref(s)}` },
    })),
  },
};

/** 구글 검색 결과 맨 위에 표시되는 사이트 이름 */
const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: site.brand.title,
  alternateName: ["메디로드", "메디로드 개원컨설팅", site.brand.nameEn],
  url: `${siteUrl}/`,
  inLanguage: "ko-KR",
  publisher: { "@id": ORG_ID },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-auth · data-loc 속성은 카페24 서버(router.php)가 응답할 때 넣는다
    <html lang="ko" suppressHydrationWarning>
      <body>
        <JsonLd data={website} />
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
