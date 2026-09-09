import type { Metadata } from "next";
import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { fmtDate } from "@/lib/listings";
import { deleteSampleListingsAction } from "@/app/actions/admin";

export const metadata: Metadata = { title: "관리자", robots: { index: false } };

export default async function AdminHome() {
  const me = await requireAdmin();
  const db = await getDb();
  const [[{ n: nL }], [{ n: nS }], [{ n: nM }], [{ n: nI }], [{ n: nD }]] = await Promise.all([
    db.select({ n: count() }).from(schema.listings),
    db.select({ n: count() }).from(schema.listings).where(eq(schema.listings.isSample, 1)),
    db.select({ n: count() }).from(schema.members).where(eq(schema.members.role, "member")),
    db.select({ n: count() }).from(schema.inquiries).where(eq(schema.inquiries.status, "new")),
    db.select({ n: count() }).from(schema.inquiries).where(eq(schema.inquiries.status, "done")),
  ]);
  const recent = await db.select().from(schema.inquiries).orderBy(desc(schema.inquiries.id)).limit(5);
  return (
    <AdminShell current="/admin" title="관리자">
      <div className="toolbar"><h3>대시보드</h3><div className="r" style={{ fontSize: "0.78em", color: "#666" }}>{me.name} 님 · <Link href="/admin/settings" style={{ color: "var(--gold)" }}>비밀번호 변경</Link></div></div>
      {me.mustChangePw ? <div className="note">초기 비밀번호를 사용 중입니다. <Link href="/admin/settings">설정</Link>에서 비밀번호를 변경해 주세요.</div> : null}
      {nS > 0 && (
        <div className="note">예시 매물 {nS}건이 등록되어 있습니다. 실제 매물을 등록한 뒤 <form action={deleteSampleListingsAction} style={{ display: "inline" }}><button type="submit">예시 매물 삭제</button></form>를 진행하세요.</div>
      )}
      <div className="mr-stats">
        <div className="item"><em>매물</em><b>{nL}</b></div>
        <div className="item"><em>회원</em><b>{nM}</b></div>
        <div className="item"><em>미확인 상담</em><b>{nI}</b></div>
        <div className="item"><em>처리완료 상담</em><b>{nD}</b></div>
      </div>
      <div className="mr-subhead"><span>최근 상담 접수</span><Link href="/admin/inquiries" style={{ fontSize: "0.75em", fontWeight: 400, color: "#666" }}>전체 보기</Link></div>
      <table className="mr-table">
        <thead><tr><th>접수일</th><th>성함</th><th>연락처</th><th>진료과목</th><th>희망 지역</th><th>상태</th></tr></thead>
        <tbody>
          {recent.length === 0 ? <tr><td colSpan={6} className="empty">접수된 상담이 없습니다.</td></tr> : recent.map((q) => {
            const f = JSON.parse(q.fields || "{}");
            return <tr key={q.id}><td>{fmtDate(q.createdAt)}</td><td><Link href={`/admin/inquiries#q${q.id}`}>{q.name}</Link></td><td>{q.phone}</td><td>{f["진료과목"] || "-"}</td><td>{f["희망 개원 지역"] || "-"}</td><td>{q.status === "done" ? "처리완료" : "신규"}</td></tr>;
          })}
        </tbody>
      </table>
    </AdminShell>
  );
}
