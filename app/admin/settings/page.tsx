import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import SettingsForm from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/auth";
import { getSetting } from "@/lib/db";

export const metadata: Metadata = { title: "설정", robots: { index: false } };

export default async function AdminSettings() {
  const me = await requireAdmin();
  const [gate, mailTo] = await Promise.all([getSetting("listing_gate", "detail"), getSetting("mail_to", process.env.MAIL_TO || "")]);
  return (
    <AdminShell current="/admin/settings" title="설정">
      <div className="toolbar"><h3>설정</h3></div>
      <SettingsForm gate={gate} mailTo={mailTo} adminId={me.userId} mustChange={!!me.mustChangePw} />
    </AdminShell>
  );
}
