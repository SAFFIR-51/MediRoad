import type { Metadata } from "next";
import { Suspense } from "react";
import MemberPage from "@/components/member/MemberPage";
import { MyPageForms } from "@/components/member/Forms";
import { requireMember } from "@/lib/auth";

export const metadata: Metadata = { title: "마이페이지" };

export default async function MyPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const me = await requireMember("/member/mypage");
  const { tab = "profile" } = await searchParams;
  return (
    <MemberPage en="My Page" title="마이페이지" desc={`${me.name}님, 안녕하세요`}>
      <Suspense fallback={null}>
        <MyPageForms me={{ userId: me.userId, name: me.name, phone: me.phone, email: me.email, createdAt: me.createdAt, lastLogin: me.lastLogin, role: me.role }} tab={["profile", "password", "withdraw"].includes(tab) ? tab : "profile"} />
      </Suspense>
    </MemberPage>
  );
}
