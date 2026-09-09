import Link from "next/link";
import SubTop from "@/components/layout/SubTop";

export const ADMIN_NAV = [
  ["/admin", "대시보드"],
  ["/admin/listings", "매물 관리"],
  ["/admin/members", "회원 관리"],
  ["/admin/inquiries", "상담 접수"],
  ["/admin/popups", "팝업 관리"],
  ["/admin/settings", "설정"],
] as const;

export function AdminFlash({ sp }: { sp: Record<string, string | undefined> }) {
  if (sp.saved) return <div className="mr-flash success">저장되었습니다.</div>;
  if (sp.deleted) return <div className="mr-flash success">삭제되었습니다.</div>;
  if (sp.error === "self") return <div className="mr-flash error">본인 계정은 차단·삭제할 수 없습니다.</div>;
  return null;
}

/** 관리자 페이지 틀: 작은 서브비주얼 + 좌측 메뉴 */
export default function AdminShell({ current, title, children }: { current: string; title: string; children: React.ReactNode }) {
  return (
    <>
      <SubTop en="Admin" title={title} desc="매물 · 회원 · 상담 · 팝업을 관리합니다" compact />
      <section className="sub_con mr-page sec_white">
        <div className="wrap">
          <div className="mr-admin">
            <div className="side">
              {ADMIN_NAV.map(([href, label]) => <Link key={href} href={href} className={current === href ? "on" : ""}>{label}</Link>)}
            </div>
            <div className="main">{children}</div>
          </div>
        </div>
      </section>
    </>
  );
}
