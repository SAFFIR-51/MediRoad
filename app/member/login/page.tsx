import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import MemberPage from "@/components/member/MemberPage";
import { LoginForm } from "@/components/member/Forms";
import { currentMember } from "@/lib/auth";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage() {
  if (await currentMember()) redirect("/member/mypage");
  return (
    <MemberPage en="Login" title="로그인" desc="회원 전용 매물 정보와 개원 로드맵을 열람하실 수 있습니다">
      <Suspense fallback={null}><LoginForm /></Suspense>
    </MemberPage>
  );
}
