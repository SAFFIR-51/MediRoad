import { Suspense } from "react";
import InquiryList from "@/components/admin/InquiryList";

export default function AdminInquiriesPage() {
  return <Suspense fallback={null}><InquiryList /></Suspense>;
}
