import { Suspense } from "react";
import ListingForm from "@/components/admin/ListingForm";

/** 매물 등록(/admin/listings/edit/) · 수정(/admin/listings/edit/?id=12) */
export default function AdminListingEditPage() {
  return <Suspense fallback={null}><ListingForm /></Suspense>;
}
