import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/lib/site";
import { currentMember } from "@/lib/auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import QuickNav from "@/components/layout/QuickNav";
import ScrollEffects from "@/components/effects/ScrollEffects";
import BodyClass from "@/components/effects/BodyClass";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || site.siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: site.brand.title, template: `%s | ${site.brand.title}` },
  description: site.brand.description,
  keywords: site.brand.keywords.split(",").map((s) => s.trim()),
  icons: { icon: site.brand.logo.favicon, apple: site.brand.logo.favicon },
  openGraph: { type: "website", siteName: site.brand.title, title: site.brand.title, description: site.brand.description, images: [{ url: site.brand.logo.og, width: 1200, height: 630 }], locale: "ko_KR" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const m = await currentMember();
  const member = m ? { name: m.name, role: m.role } : null;
  return (
    <html lang="ko">
      <body>
        <BodyClass />
        <Header member={member} />
        {children}
        <QuickNav />
        <Footer />
        <ScrollEffects />
      </body>
    </html>
  );
}
