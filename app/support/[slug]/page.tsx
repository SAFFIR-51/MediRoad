import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetail from "@/components/service/ServiceDetail";
import { findService, servicesIn } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return servicesIn("support").map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = findService("support", slug);
  return s ? pageMeta(`/support/${slug}`, { title: s.title, description: s.desc.replace(/<[^>]+>/g, "") }) : {};
}

export default async function SupportFieldPage({ params }: Props) {
  const { slug } = await params;
  const s = findService("support", slug);
  if (!s) notFound();
  return <ServiceDetail s={s} />;
}
