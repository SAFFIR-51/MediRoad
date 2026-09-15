import { Suspense } from "react";
import ListingAdminList from "@/components/admin/ListingAdminList";

export default function AdminListingsPage() {
  return <Suspense fallback={null}><ListingAdminList /></Suspense>;
}
