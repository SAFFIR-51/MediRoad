import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { allListings, listingUrl } from "@/lib/listings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || site.siteUrl;
  const pages = ["/", "/about", "/about/greeting", "/about/location", "/consulting", "/location", "/location?type=lease", "/location?type=sale", "/consulting/opening", "/consulting/transfer", "/consulting/closure", "/consulting/marketing", "/contact", "/terms", "/privacy"];
  const listings = allListings();
  return [
    ...pages.map((p) => ({ url: base + p, changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...listings.filter((l) => l.status === "open").map((l) => ({ url: base + listingUrl(l.code), lastModified: l.dateListed, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
