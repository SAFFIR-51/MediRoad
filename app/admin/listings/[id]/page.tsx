import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import AdminShell from "@/components/admin/AdminShell";
import ListingForm from "@/components/admin/ListingForm";
import { requireAdmin } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { parseListing } from "@/lib/listings";

export const metadata: Metadata = { title: "매물 수정", robots: { index: false } };

export default async function EditListing({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const db = await getDb();
  const row = await db.query.listings.findFirst({ where: eq(schema.listings.id, Number(id)) });
  if (!row) notFound();
  return (
    <AdminShell current="/admin/listings" title="매물 관리">
      <div className="toolbar"><h3>매물 수정 <small>{row.code}</small></h3></div>
      <ListingForm l={parseListing(row)} />
    </AdminShell>
  );
}
