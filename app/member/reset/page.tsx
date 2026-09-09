import type { Metadata } from "next";
import MemberPage from "@/components/member/MemberPage";
import { ResetForm } from "@/components/member/Forms";

export const metadata: Metadata = { title: "비밀번호 재설정" };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <MemberPage en="Reset Password" title="비밀번호 재설정" desc="새 비밀번호를 입력해 주세요">
      {token ? <ResetForm token={token} /> : <div className="mr-flash error">잘못된 접근입니다. 비밀번호 찾기에서 다시 요청해 주세요.</div>}
    </MemberPage>
  );
}
