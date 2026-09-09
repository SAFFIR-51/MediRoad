"use client";

/** 회원 폼 (로그인 · 가입 · 찾기 · 재설정 · 마이페이지) — useActionState 로 서버 액션 결과를 표시 */
import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FormState } from "@/app/actions/member";
import { joinAction, loginAction, findIdAction, findPwAction, resetPwAction, updateProfileAction, changePasswordAction, withdrawAction } from "@/app/actions/member";

export function Flash({ state, info }: { state: FormState; info?: string }) {
  if (state?.message) return <div className={`mr-flash ${state.ok ? "success" : "error"}`}>{state.message}{state.extra?.link ? <> <Link href={state.extra.link} style={{ fontWeight: 600 }}>→ 비밀번호 재설정</Link></> : null}</div>;
  if (info) return <div className="mr-flash">{info}</div>;
  return null;
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const info = params.get("reason") === "admin" ? "관리자만 접근할 수 있습니다." : params.get("reset") ? "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요." : params.get("next") ? "회원 전용 페이지입니다. 로그인 후 이용해 주세요." : undefined;
  return (
    <div className="mr-form">
      <Flash state={state} info={info} />
      <form action={action}>
        <input type="hidden" name="next" value={next} />
        <div className="row"><label>아이디</label><input type="text" name="user_id" required autoFocus autoComplete="username" /></div>
        <div className="row"><label>비밀번호</label><input type="password" name="password" required autoComplete="current-password" /></div>
        <button className="btn full" type="submit" disabled={pending}>로그인</button>
      </form>
      <div className="links"><Link href="/member/join">회원가입</Link><Link href="/member/find">아이디 · 비밀번호 찾기</Link></div>
    </div>
  );
}

export function JoinForm() {
  const [state, action, pending] = useActionState(joinAction, null);
  return (
    <div className="mr-form">
      <Flash state={state} />
      <form action={action}>
        <div className="row"><label>아이디<i>*</i></label><input type="text" name="user_id" placeholder="영문 소문자·숫자 4~20자" required autoComplete="username" /></div>
        <div className="grid2">
          <div className="row"><label>비밀번호<i>*</i></label><input type="password" name="password" placeholder="8자 이상" required autoComplete="new-password" /></div>
          <div className="row"><label>비밀번호 확인<i>*</i></label><input type="password" name="password2" required autoComplete="new-password" /></div>
        </div>
        <div className="row"><label>이름<i>*</i></label><input type="text" name="name" required /></div>
        <div className="grid2">
          <div className="row"><label>휴대전화<i>*</i></label><input type="tel" name="phone" placeholder="010-0000-0000" required /></div>
          <div className="row"><label>이메일<i>*</i></label><input type="email" name="email" required /></div>
        </div>
        <div className="row check"><input type="checkbox" name="agree_terms" id="agree_terms" required /><label htmlFor="agree_terms">이용약관에 동의합니다.</label><Link href="/terms" target="_blank">[보기]</Link></div>
        <div className="row check"><input type="checkbox" name="agree_privacy" id="agree_privacy" required /><label htmlFor="agree_privacy">개인정보처리방침에 동의합니다.</label><Link href="/privacy" target="_blank">[보기]</Link></div>
        <button className="btn full" type="submit" disabled={pending}>가입하기</button>
      </form>
      <div className="links"><Link href="/member/login">이미 회원이신가요? 로그인</Link></div>
    </div>
  );
}

export function FindForm() {
  const [idState, idAction, idPending] = useActionState(findIdAction, null);
  const [pwState, pwAction, pwPending] = useActionState(findPwAction, null);
  return (
    <>
      <div className="mr-form">
        <h3>아이디 찾기</h3>
        <div className="sub">가입 시 입력한 이름과 이메일을 입력해 주세요.</div>
        <Flash state={idState} />
        <form action={idAction}>
          <div className="row"><label>이름</label><input type="text" name="name" required /></div>
          <div className="row"><label>이메일</label><input type="email" name="email" required /></div>
          <button className="btn" type="submit" disabled={idPending}>아이디 찾기</button>
        </form>
      </div>
      <div className="mr-form" style={{ marginTop: 60 }}>
        <h3>비밀번호 찾기</h3>
        <div className="sub">아이디와 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.</div>
        <Flash state={pwState} />
        <form action={pwAction}>
          <div className="row"><label>아이디</label><input type="text" name="user_id" required /></div>
          <div className="row"><label>이메일</label><input type="email" name="email" required /></div>
          <button className="btn" type="submit" disabled={pwPending}>재설정 링크 받기</button>
        </form>
        <div className="links"><Link href="/member/login">로그인</Link><Link href="/member/join">회원가입</Link></div>
      </div>
    </>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPwAction, null);
  return (
    <div className="mr-form">
      <Flash state={state} />
      <form action={action}>
        <input type="hidden" name="token" value={token} />
        <div className="row"><label>새 비밀번호</label><input type="password" name="password" required autoComplete="new-password" /></div>
        <div className="row"><label>새 비밀번호 확인</label><input type="password" name="password2" required autoComplete="new-password" /></div>
        <button className="btn full" type="submit" disabled={pending}>변경하기</button>
      </form>
    </div>
  );
}

type Me = { userId: string; name: string; phone: string | null; email: string | null; createdAt: string; lastLogin: string | null; role: string };

export function MyPageForms({ me, tab }: { me: Me; tab: string }) {
  const [pState, pAction, pPending] = useActionState(updateProfileAction, null);
  const [wState, wAction, wPending] = useActionState(changePasswordAction, null);
  const [dState, dAction, dPending] = useActionState(withdrawAction, null);
  const params = useSearchParams();
  const tabs = [["profile", "회원 정보"], ["password", "비밀번호 변경"], ...(me.role === "admin" ? [] : [["withdraw", "회원 탈퇴"]])];
  return (
    <div className="mr-form">
      <div className="tabs">{tabs.map(([k, l]) => <Link key={k} href={`/member/mypage?tab=${k}`} className={tab === k ? "on" : ""}>{l}</Link>)}</div>
      {params.get("joined") && <div className="mr-flash success">회원가입이 완료되었습니다. 환영합니다!</div>}
      {params.get("must") && <div className="mr-flash">초기 비밀번호를 사용 중입니다. 보안을 위해 비밀번호를 변경해 주세요.</div>}
      {tab === "profile" && (
        <>
          <Flash state={pState} />
          <form action={pAction}>
            <div className="row"><label>아이디</label><input type="text" value={me.userId} readOnly /></div>
            <div className="row"><label>이름</label><input type="text" name="name" defaultValue={me.name} required /></div>
            <div className="grid2">
              <div className="row"><label>휴대전화</label><input type="tel" name="phone" defaultValue={me.phone ?? ""} /></div>
              <div className="row"><label>이메일</label><input type="email" name="email" defaultValue={me.email ?? ""} /></div>
            </div>
            <div className="help">가입일 {me.createdAt.slice(0, 10)} · 최근 로그인 {me.lastLogin ?? "-"}</div>
            <div style={{ paddingTop: 20 }}><button className="btn" type="submit" disabled={pPending}>저장하기</button></div>
          </form>
        </>
      )}
      {tab === "password" && (
        <>
          <Flash state={wState} />
          <form action={wAction}>
            <div className="row"><label>현재 비밀번호</label><input type="password" name="current" required autoComplete="current-password" /></div>
            <div className="row"><label>새 비밀번호</label><input type="password" name="password" required autoComplete="new-password" /></div>
            <div className="row"><label>새 비밀번호 확인</label><input type="password" name="password2" required autoComplete="new-password" /></div>
            <button className="btn" type="submit" disabled={wPending}>변경하기</button>
          </form>
        </>
      )}
      {tab === "withdraw" && (
        <>
          <Flash state={dState} />
          <form action={dAction} onSubmit={(e) => { if (!confirm("정말 탈퇴하시겠습니까? 탈퇴 후에는 회원 전용 서비스를 이용할 수 없습니다.")) e.preventDefault(); }}>
            <div className="help" style={{ paddingBottom: 16 }}>탈퇴 시 회원 전용 매물 열람과 개원 로드맵 이용이 중단됩니다.</div>
            <div className="row"><label>비밀번호 확인</label><input type="password" name="password" required /></div>
            <button className="mr-btn danger" type="submit" disabled={dPending}>탈퇴하기</button>
          </form>
        </>
      )}
      <div className="links"><Link href="/location">매물 보기</Link><Link href="/consulting/roadmap">개원 로드맵</Link><a href="/member/logout">로그아웃</a></div>
    </div>
  );
}
