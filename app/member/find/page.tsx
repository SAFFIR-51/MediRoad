import type { Metadata } from "next";
import MemberPage from "@/components/member/MemberPage";
import { FindForm } from "@/components/member/Forms";

export const metadata: Metadata = { title: "아이디 · 비밀번호 찾기" };

export default function FindPage() {
  return (
    <MemberPage en="Find Account" title="아이디 · 비밀번호 찾기" desc="가입 시 입력한 정보로 계정을 확인합니다">
      <FindForm />
    </MemberPage>
  );
}
