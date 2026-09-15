import AuthPage from "@/components/auth/AuthPage";
import { LoginForm } from "@/components/auth/AuthForms";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/login", { title: "로그인" }, { noindex: true });

export default function LoginPage() {
  return <AuthPage en="Member Login" title="로그인"><LoginForm /></AuthPage>;
}
