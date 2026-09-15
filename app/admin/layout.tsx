import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "관리자", robots: { index: false, follow: false } };

/** 관리자 화면 공통 틀. 서버(router.php)가 관리자만 들여보내고, AdminShell 이 한 번 더 확인한다. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
