import AuthPage from "@/components/auth/AuthPage";
import { ResetForm } from "@/components/auth/AuthForms";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/reset-password", { title: "비밀번호 재설정" }, { noindex: true });

export default function ResetPasswordPage() {
  return <AuthPage en="Password" title="비밀번호 재설정"><ResetForm /></AuthPage>;
}
