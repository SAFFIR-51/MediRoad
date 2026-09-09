import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MemberPage from "@/components/member/MemberPage";
import { JoinForm } from "@/components/member/Forms";
import { currentMember } from "@/lib/auth";

export const metadata: Metadata = { title: "회원가입" };

export default async function JoinPage() {
  if (await currentMember()) redirect("/member/mypage");
  return (
    <MemberPage en="Join" title="회원가입" desc="가입 후 매물 상세 정보와 개원 로드맵을 이용하실 수 있습니다">
      <JoinForm />
    </MemberPage>
  );
}
