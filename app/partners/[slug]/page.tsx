import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PartnerDetail from "@/components/service/PartnerDetail";
import { findService, servicesIn } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return servicesIn("partners").map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = findService("partners", slug);
  return s ? pageMeta(`/partners/${slug}`, { title: s.title, description: s.desc.replace(/<[^>]+>/g, "") }) : {};
}

export default async function PartnerPage({ params }: Props) {
  const { slug } = await params;
  const s = findService("partners", slug);
  if (!s) notFound();
  return <PartnerDetail s={s} />;
}
