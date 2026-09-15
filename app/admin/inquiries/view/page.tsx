import { Suspense } from "react";
import InquiryView from "@/components/admin/InquiryView";

export default function AdminInquiryViewPage() {
  return <Suspense fallback={null}><InquiryView /></Suspense>;
}
