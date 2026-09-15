import AuthPage from "@/components/auth/AuthPage";
import { ForgotForm } from "@/components/auth/AuthForms";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/forgot-password", { title: "비밀번호 찾기" }, { noindex: true });

export default function ForgotPasswordPage() {
  return <AuthPage en="Password" title="비밀번호 찾기"><ForgotForm /></AuthPage>;
}
