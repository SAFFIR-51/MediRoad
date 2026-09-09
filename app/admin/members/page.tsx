import type { Metadata } from "next";
import { desc, like, or } from "drizzle-orm";
import AdminShell, { AdminFlash } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { updateMemberAction } from "@/app/actions/admin";

export const metadata: Metadata = { title: "회원 관리", robots: { index: false } };

const STATUS: Record<string, string> = { active: "정상", blocked: "차단", withdrawn: "탈퇴" };

export default async function AdminMembers({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const db = await getDb();
  const rows = await db.select().from(schema.members)
    .where(q ? or(like(schema.members.userId, `%${q}%`), like(schema.members.name, `%${q}%`), like(schema.members.email, `%${q}%`), like(schema.members.phone, `%${q}%`)) : undefined)
    .orderBy(desc(schema.members.id));
  return (
    <AdminShell current="/admin/members" title="회원 관리">
      <div className="toolbar">
        <h3>회원 관리 <small>{rows.length}명</small></h3>
        <form className="mr-search" method="get" style={{ padding: 0 }}><input type="text" name="q" defaultValue={q} placeholder="아이디 · 이름 · 이메일 · 전화" /><button className="mr-btn sm" type="submit">검색</button></form>
      </div>
      <AdminFlash sp={sp} />
      <table className="mr-table">
        <thead><tr><th>아이디</th><th>이름</th><th>연락처</th><th>이메일</th><th>가입일</th><th>최근 로그인</th><th>상태</th><th>메모</th><th>관리</th></tr></thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id}>
              <td>{m.userId}{m.role === "admin" ? <span className="mr-badge" style={{ marginLeft: 6 }}>관리자</span> : null}</td>
              <td>{m.name}</td>
              <td>{m.phone || "-"}</td>
              <td>{m.email || "-"}</td>
              <td>{m.createdAt.slice(0, 10)}</td>
              <td>{m.lastLogin ? m.lastLogin.slice(0, 16) : "-"}</td>
              <td>{STATUS[m.status] ?? m.status}</td>
              <td>
                <form action={updateMemberAction} style={{ display: "flex", gap: 4 }}>
                  <input type="hidden" name="id" value={m.id} /><input type="hidden" name="act" value="memo" />
                  <input type="text" name="memo" defaultValue={m.memo ?? ""} style={{ width: 140, height: 30, fontSize: "0.9em", border: 0, borderBottom: "1px solid #ddd", background: "transparent" }} />
                  <button className="mr-btn sm line" type="submit">저장</button>
                </form>
              </td>
              <td>
                {m.id !== me.id && (
                  <div className="acts">
                    {m.status === "active"
                      ? <form action={updateMemberAction}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="act" value="block" /><button className="mr-btn sm line" type="submit">차단</button></form>
                      : <form action={updateMemberAction}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="act" value="activate" /><button className="mr-btn sm line" type="submit">정상화</button></form>}
                    <form action={updateMemberAction}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="act" value="resetpw" /><button className="mr-btn sm line" type="submit" title="mediroad1234! 로 초기화">비번초기화</button></form>
                    <form action={updateMemberAction}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="act" value="delete" /><button className="mr-btn sm danger" type="submit">삭제</button></form>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mr-notice" style={{ textAlign: "left" }}>비밀번호 초기화 시 임시 비밀번호는 <b>mediroad1234!</b> 이며, 해당 회원은 다음 로그인 때 비밀번호 변경 안내를 받습니다.</p>
    </AdminShell>
  );
}
