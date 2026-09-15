import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/location/", "/admin/", "/login/", "/signup/", "/forgot-password/", "/reset-password/", "/api/", "/install/", "/uploads/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
