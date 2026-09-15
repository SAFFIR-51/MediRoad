import AuthPage from "@/components/auth/AuthPage";
import { SignupForm } from "@/components/auth/AuthForms";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/signup", { title: "회원가입" }, { noindex: true });

export default function SignupPage() {
  return <AuthPage en="Join" title="회원가입"><SignupForm /></AuthPage>;
}
