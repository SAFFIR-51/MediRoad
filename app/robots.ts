import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || site.siteUrl;
  return { rules: [{ userAgent: "*", allow: "/", disallow: [] }], sitemap: `${base}/sitemap.xml` };
}
