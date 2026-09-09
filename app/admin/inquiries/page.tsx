import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import AdminShell, { AdminFlash } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { updateInquiryAction } from "@/app/actions/admin";

export const metadata: Metadata = { title: "상담 접수", robots: { index: false } };

export default async function AdminInquiries({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const st = sp.status === "new" || sp.status === "done" ? sp.status : "";
  const db = await getDb();
  const rows = await db.select().from(schema.inquiries).where(st ? eq(schema.inquiries.status, st) : undefined).orderBy(desc(schema.inquiries.id));
  return (
    <AdminShell current="/admin/inquiries" title="상담 접수">
      <div className="toolbar">
        <h3>상담 접수 <small>{rows.length}건</small></h3>
        <div className="r">
          <Link className={`mr-btn sm ${st ? "line" : ""}`} href="/admin/inquiries">전체</Link>
          <Link className={`mr-btn sm ${st === "new" ? "" : "line"}`} href="/admin/inquiries?status=new">신규</Link>
          <Link className={`mr-btn sm ${st === "done" ? "" : "line"}`} href="/admin/inquiries?status=done">처리완료</Link>
        </div>
      </div>
      <AdminFlash sp={sp} />
      {rows.length === 0 ? <div className="mr-table"><div className="empty" style={{ padding: "60px 0", textAlign: "center", color: "#999" }}>접수된 상담이 없습니다.</div></div> : rows.map((q) => {
        const f: Record<string, string> = JSON.parse(q.fields || "{}");
        return (
          <div key={q.id} id={`q${q.id}`} style={{ padding: "20px 0", borderBottom: "1px solid #e6e6e6", fontSize: "0.85em" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div><b style={{ fontSize: "1.1em" }}>{q.name}</b> · {q.phone} · {q.email} <span className={`mr-badge ${q.status === "done" ? "sale" : ""}`} style={{ marginLeft: 8 }}>{q.status === "done" ? "처리완료" : "신규"}</span></div>
              <div style={{ color: "#888" }}>{q.createdAt}{q.listingCode ? <> · 매물 <Link href={`/location/${encodeURIComponent(q.listingCode)}`} style={{ color: "var(--gold)" }}>{q.listingCode}</Link></> : null}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "4px 20px", padding: "12px 0", color: "#444" }}>
              {Object.entries(f).map(([k, v]) => <div key={k}><span style={{ color: "#999" }}>{k}</span> : {v}</div>)}
            </div>
            {q.message && <div style={{ whiteSpace: "pre-wrap", padding: "10px 12px", background: "#f7f8fa", color: "#333" }}>{q.message}</div>}
            <form action={updateInquiryAction} style={{ display: "flex", gap: 6, alignItems: "center", paddingTop: 12, flexWrap: "wrap" }}>
              <input type="hidden" name="id" value={q.id} />
              <input type="text" name="memo" defaultValue={q.memo ?? ""} placeholder="처리 메모" style={{ flex: 1, minWidth: 200, height: 32, border: 0, borderBottom: "1px solid #ddd", background: "transparent" }} />
              <button className="mr-btn sm" type="submit" name="act" value={q.status === "done" ? "new" : "done"}>{q.status === "done" ? "신규로 되돌리기" : "처리완료 + 메모 저장"}</button>
              <button className="mr-btn sm line" type="submit" name="act" value={q.status}>메모만 저장</button>
              <button className="mr-btn sm danger" type="submit" name="act" value="delete">삭제</button>
            </form>
          </div>
        );
      })}
    </AdminShell>
  );
}
