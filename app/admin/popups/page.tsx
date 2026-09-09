import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import AdminShell, { AdminFlash } from "@/components/admin/AdminShell";
import PopupForm from "@/components/admin/PopupForm";
import PopupList from "@/components/admin/PopupList";
import { requireAdmin } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";

export const metadata: Metadata = { title: "팝업 관리", robots: { index: false } };

export default async function AdminPopups({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const db = await getDb();
  const rows = await db.select().from(schema.popups).orderBy(desc(schema.popups.id));
  return (
    <AdminShell current="/admin/popups" title="팝업 관리">
      <div className="toolbar"><h3>팝업 관리 <small>{rows.length}건</small></h3></div>
      <AdminFlash sp={sp} />
      <div className="note">홈 화면에 표시되는 오픈 팝업입니다. 게시 기간 안에 있고 &quot;게시&quot;가 켜진 팝업만 노출되며, 방문자는 &quot;오늘 하루 보지 않기&quot;를 선택할 수 있습니다.</div>
      <PopupList rows={rows} />
      <div className="mr-subhead"><span>새 팝업 등록</span></div>
      <PopupForm p={null} />
    </AdminShell>
  );
}
