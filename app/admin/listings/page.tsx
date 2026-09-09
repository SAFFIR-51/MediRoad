import type { Metadata } from "next";
import Link from "next/link";
import AdminShell, { AdminFlash } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { allListings, fmtDate, typeLabel } from "@/lib/listings";
import { deleteListingAction, deleteSampleListingsAction } from "@/app/actions/admin";

export const metadata: Metadata = { title: "매물 관리", robots: { index: false } };

export default async function AdminListings({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = sp.status || "";
  const rows = (await allListings({ includeHidden: true })).filter((l) => !status || l.status === status);
  const hasSample = rows.some((l) => l.isSample);
  return (
    <AdminShell current="/admin/listings" title="매물 관리">
      <div className="toolbar">
        <h3>매물 관리 <small>{rows.length}건</small></h3>
        <div className="r">
          <Link className={`mr-btn sm ${status ? "line" : ""}`} href="/admin/listings">전체</Link>
          <Link className={`mr-btn sm ${status === "closed" ? "" : "line"}`} href="/admin/listings?status=closed">거래완료</Link>
          <Link className={`mr-btn sm ${status === "hidden" ? "" : "line"}`} href="/admin/listings?status=hidden">숨김</Link>
          {hasSample && <form action={deleteSampleListingsAction}><button className="mr-btn sm danger" type="submit">예시 매물 삭제</button></form>}
          <Link className="mr-btn sm" href="/admin/listings/new">+ 매물 등록</Link>
        </div>
      </div>
      <AdminFlash sp={sp} />
      <table className="mr-table">
        <thead><tr><th>번호</th><th>제목</th><th>구분</th><th>지역</th><th>등록일</th><th>상태</th><th className="c">조회</th><th>관리</th></tr></thead>
        <tbody>
          {rows.length === 0 ? <tr><td colSpan={8} className="empty">매물이 없습니다.</td></tr> : rows.map((l) => (
            <tr key={l.id}>
              <td className="num">{l.code}</td>
              <td><Link href={`/location/${encodeURIComponent(l.code)}`} target="_blank">{l.title}</Link> {l.isSample ? <span className="mr-badge sample">예시</span> : null}</td>
              <td>{typeLabel(l.type)} · {l.category}</td>
              <td>{l.region}</td>
              <td>{fmtDate(l.dateListed)}</td>
              <td>{{ open: "노출", closed: "거래완료", hidden: "숨김" }[l.status] ?? l.status}</td>
              <td className="c">{l.views}</td>
              <td><div className="acts">
                <Link className="mr-btn sm line" href={`/admin/listings/${l.id}`}>수정</Link>
                <form action={deleteListingAction}><input type="hidden" name="id" value={l.id} /><button className="mr-btn sm danger" type="submit">삭제</button></form>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminShell>
  );
}
