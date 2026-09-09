import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import ListingForm from "@/components/admin/ListingForm";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "매물 등록", robots: { index: false } };

export default async function NewListing() {
  await requireAdmin();
  return (
    <AdminShell current="/admin/listings" title="매물 관리">
      <div className="toolbar"><h3>매물 등록</h3></div>
      <ListingForm l={null} />
    </AdminShell>
  );
}
