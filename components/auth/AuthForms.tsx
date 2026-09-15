"use client";

/**
 * 회원 화면 폼 (로그인 · 회원가입 · 비밀번호 찾기 · 재설정). PHP API(/api/auth/*) 호출.
 * 로그인·가입에 성공하면 전체 새로고침으로 이동한다 — 서버가 <html data-auth> 를 새로 넣어 헤더 링크가 바뀌도록.
 */
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, ApiError, safeNext } from "@/lib/api";

function useSubmit() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const run = async (fn: () => Promise<void>) => {
    setPending(true);
    setError("");
    setErrors({});
    try {
      await fn();
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        setErrors(e.errors ?? {});
      } else setError("요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setPending(false);
    }
  };
  return { pending, error, errors, setError, run };
}

const FieldError = ({ msg }: { msg?: string }) => (msg ? <p className="err">{msg}</p> : null);

export function LoginForm() {
  const next = safeNext(useSearchParams().get("next"));
  const { pending, error, run } = useSubmit();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      await api("auth/login.php", { body: { email, password } });
      window.location.href = next;
    });
  };

  return (
    <form className="mr-form auth" onSubmit={submit}>
      <h3>로그인</h3>
      <p className="sub">매물 정보는 회원에게만 공개됩니다. 가입하신 이메일로 로그인해 주세요.</p>
      {error ? <div className="mr-flash error" role="alert">{error}</div> : null}
      <div className="row"><label htmlFor="lg-email">이메일</label><input id="lg-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
      <div className="row"><label htmlFor="lg-pw">비밀번호</label><input id="lg-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
      <button className="btn full" type="submit" disabled={pending}>{pending ? "확인 중…" : "로그인"}</button>
      <div className="links">
        <Link href={`/signup/?next=${encodeURIComponent(next)}`}>회원가입</Link>
        <Link href="/forgot-password/">비밀번호 찾기</Link>
      </div>
    </form>
  );
}

export function SignupForm() {
  const next = safeNext(useSearchParams().get("next"));
  const { pending, error, errors, setError, run } = useSubmit();
  const [f, setF] = useState({ email: "", password: "", password2: "", name: "", phone: "", agree: false });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (f.password.length < 8) return setError("비밀번호는 8자 이상으로 입력해 주세요.");
    if (f.password !== f.password2) return setError("비밀번호 확인이 일치하지 않습니다.");
    if (!f.agree) return setError("이용약관과 개인정보처리방침에 동의해 주세요.");
    run(async () => {
      await api("auth/signup.php", { body: { email: f.email, password: f.password, name: f.name, phone: f.phone, agree: true } });
      window.location.href = next;
    });
  };

  return (
    <form className="mr-form auth" onSubmit={submit}>
      <h3>회원가입</h3>
      <p className="sub">가입하시면 병·의원 임대·분양과 병원 매매 매물 정보를 확인하실 수 있습니다.</p>
      {error ? <div className="mr-flash error" role="alert">{error}</div> : null}
      <div className="row"><label htmlFor="su-email">이메일<i>*</i></label><input id="su-email" type="email" autoComplete="email" value={f.email} onChange={set("email")} maxLength={120} required /><FieldError msg={errors.email} /></div>
      <div className="grid2">
        <div className="row"><label htmlFor="su-pw">비밀번호<i>*</i></label><input id="su-pw" type="password" autoComplete="new-password" value={f.password} onChange={set("password")} minLength={8} required /><p className="help">8자 이상</p><FieldError msg={errors.password} /></div>
        <div className="row"><label htmlFor="su-pw2">비밀번호 확인<i>*</i></label><input id="su-pw2" type="password" autoComplete="new-password" value={f.password2} onChange={set("password2")} minLength={8} required /></div>
      </div>
      <div className="grid2">
        <div className="row"><label htmlFor="su-name">이름<i>*</i></label><input id="su-name" type="text" autoComplete="name" value={f.name} onChange={set("name")} maxLength={50} required /><FieldError msg={errors.name} /></div>
        <div className="row"><label htmlFor="su-phone">연락처<i>*</i></label><input id="su-phone" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} maxLength={30} required /><FieldError msg={errors.phone} /></div>
      </div>
      <label className="check"><input type="checkbox" checked={f.agree} onChange={set("agree")} /> <span><a href="/terms/" target="_blank" rel="noopener">이용약관</a>과 <a href="/privacy/" target="_blank" rel="noopener">개인정보처리방침</a>에 동의합니다. (필수)</span></label>
      <button className="btn full" type="submit" disabled={pending}>{pending ? "가입 중…" : "가입하기"}</button>
      <div className="links"><span>이미 회원이신가요?</span><Link href={`/login/?next=${encodeURIComponent(next)}`}>로그인</Link></div>
    </form>
  );
}

export function ForgotForm() {
  const { pending, error, run } = useSubmit();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      await api("auth/forgot.php", { body: { email } });
      setSent(true);
    });
  };

  if (sent) {
    return (
      <div className="mr-form auth">
        <h3>메일을 확인해 주세요</h3>
        <p className="sub">가입된 이메일이라면 비밀번호 재설정 링크를 보냈습니다. 링크는 1시간 동안 유효합니다.<br />메일이 오지 않으면 스팸함을 확인하시거나 전화로 문의해 주세요.</p>
        <Link className="btn full" href="/login/">로그인으로</Link>
      </div>
    );
  }

  return (
    <form className="mr-form auth" onSubmit={submit}>
      <h3>비밀번호 찾기</h3>
      <p className="sub">가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내 드립니다.</p>
      {error ? <div className="mr-flash error" role="alert">{error}</div> : null}
      <div className="row"><label htmlFor="fg-email">이메일</label><input id="fg-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
      <button className="btn full" type="submit" disabled={pending}>{pending ? "보내는 중…" : "재설정 링크 보내기"}</button>
      <div className="links"><Link href="/login/">로그인</Link><Link href="/signup/">회원가입</Link></div>
    </form>
  );
}

export function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const { pending, error, setError, run } = useSubmit();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setError("비밀번호는 8자 이상으로 입력해 주세요.");
    if (pw !== pw2) return setError("비밀번호 확인이 일치하지 않습니다.");
    run(async () => {
      await api("auth/reset.php", { body: { token, password: pw } });
      setDone(true);
    });
  };

  if (!token) {
    return (
      <div className="mr-form auth">
        <h3>링크가 올바르지 않습니다</h3>
        <p className="sub">메일에 있는 재설정 링크를 다시 눌러 주시거나, 재설정 메일을 새로 받아 주세요.</p>
        <Link className="btn full" href="/forgot-password/">재설정 메일 다시 받기</Link>
      </div>
    );
  }
  if (done) {
    return (
      <div className="mr-form auth">
        <h3>비밀번호를 변경했습니다</h3>
        <p className="sub">새 비밀번호로 로그인해 주세요.</p>
        <Link className="btn full" href="/login/">로그인</Link>
      </div>
    );
  }
  return (
    <form className="mr-form auth" onSubmit={submit}>
      <h3>새 비밀번호 설정</h3>
      <p className="sub">사용하실 새 비밀번호를 입력해 주세요.</p>
      {error ? <div className="mr-flash error" role="alert">{error}</div> : null}
      <div className="row"><label htmlFor="rs-pw">새 비밀번호</label><input id="rs-pw" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={8} required /><p className="help">8자 이상</p></div>
      <div className="row"><label htmlFor="rs-pw2">새 비밀번호 확인</label><input id="rs-pw2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} minLength={8} required /></div>
      <button className="btn full" type="submit" disabled={pending}>{pending ? "변경 중…" : "비밀번호 변경"}</button>
    </form>
  );
}
