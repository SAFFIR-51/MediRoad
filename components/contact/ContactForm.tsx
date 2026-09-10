"use client";

/**
 * 상담 신청 폼 (/contact 전용). 서버 액션 submitConsult 와 필드명은 동일하게 유지한다.
 * 매물 상세에서 넘어오면 sessionStorage(mr_listing) 또는 ?listing= 값을 요청사항에 채운다.
 */
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { site } from "@/lib/site";
import { submitConsult } from "@/app/actions/consult";
import PrivacyModal from "@/components/ui/PrivacyModal";

const TIMING = ["3개월 이내", "6개월 이내", "1년 이후"];
const BUDGET = ["3억 미만", "3 ~ 5억", "5억 이상"];
const DEPOSIT = ["1억~3억", "3억~5억", "5억 이상"];
const RENT = ["1000만원 미만", "1000만원~2000만원", "2000만원 이상"];
const FACILITY = ["5천 이하", "5천~1억", "1억 이상"];
const AREA = ["100평 이하", "100평~150평", "150평 이상"];
const TYPES = ["신규개원", "병원양도", "병원양수"];

function Select({ name, id, label, options, required, placeholder }: { name: string; id: string; label: string; options: string[]; required?: boolean; placeholder: string }) {
  return (
    <div className="row">
      <label className="lb" htmlFor={id}>{label}{required ? <i>*</i> : null}</label>
      <select name={name} id={id} required={required} defaultValue="">
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Pills({ name, options, defaultValue }: { name: string; options: string[]; defaultValue: string }) {
  return (
    <div className="pills">
      {options.map((o) => {
        const id = `${name}-${o}`;
        return (
          <span key={o}>
            <input type="radio" name={name} value={o} id={id} defaultChecked={o === defaultValue} />
            <label htmlFor={id}>{o}</label>
          </span>
        );
      })}
    </div>
  );
}

export default function ContactForm() {
  const [state, action, pending] = useActionState(submitConsult, null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [listing, setListing] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const params = useSearchParams();

  useEffect(() => {
    try {
      const v = sessionStorage.getItem("mr_listing");
      const q = params.get("listing");
      const ta = taRef.current;
      if (ta && !ta.value && (v || q)) ta.value = (v || `[${q}] 매물 문의`) + "\n";
      if (v) sessionStorage.removeItem("mr_listing");
      if (q) setListing(q);
    } catch {}
  }, [params]);

  useEffect(() => {
    if (!state) return;
    if (state.ok) document.querySelector(".mr-done")?.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (state.message) topRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state]);

  // form action 대신 onSubmit 에서 직접 호출: 서버가 오류를 돌려줘도 입력값이 초기화되지 않는다 (React 19 form reset 회피)
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };

  if (state?.ok) {
    return (
      <div className="mr-done">
        <i className="xi-check-circle-o"></i>
        <h4>상담 신청이 접수되었습니다</h4>
        <p>담당자가 확인 후 1영업일 내 연락드리겠습니다.<br />급한 문의는 {site.contact.headerTel} 로 전화 주세요.</p>
        <div className="btns"><Link className="mr-btn" href="/">홈으로</Link><Link className="mr-btn line" href="/location">매물 보기</Link></div>
      </div>
    );
  }

  return (
    <>
      <form className="mr-cform" onSubmit={onSubmit}>
        <div ref={topRef}>
          {state && !state.ok && state.message ? <div className="mr-flash error" role="alert">{state.message}</div> : null}
        </div>

        <fieldset>
          <legend><em>01</em>기본 정보</legend>
          <div className="grid">
            <div className="row"><label className="lb" htmlFor="c-name">성함<i>*</i></label><input type="text" name="name" id="c-name" placeholder="성함을 입력하세요" required autoComplete="name" /></div>
            <div className="row"><label className="lb" htmlFor="c-phone">연락처 (휴대폰번호)<i>*</i></label><input type="tel" name="phone" id="c-phone" placeholder="010-0000-0000" required autoComplete="tel" /></div>
            <div className="row full"><label className="lb" htmlFor="c-email">이메일 주소<i>*</i></label><input type="email" name="이메일" id="c-email" placeholder="example@email.com" required autoComplete="email" /></div>
          </div>
        </fieldset>

        <fieldset>
          <legend><em>02</em>개원 계획</legend>
          <div className="grid">
            <div className="row"><label className="lb" htmlFor="c-clinic">진료과목<i>*</i></label><input type="text" name="진료과목" id="c-clinic" placeholder="예) 내과, 정형외과, 치과" required /></div>
            <div className="row"><label className="lb" htmlFor="c-area">희망 개원 지역<i>*</i></label><input type="text" name="희망 개원 지역" id="c-area" placeholder="예) 서울 강서구, 경기 하남" required /></div>
            <Select name="개원 예정 시기" id="c-date" label="개원 예정 시기" options={TIMING} required placeholder="개원 예정 시기를 선택하세요" />
            <Select name="자금 규모" id="c-money" label="자금 규모" options={BUDGET} required placeholder="자금 규모를 선택하세요" />
            <div className="row full">
              <label className="lb">상담유형</label>
              <Pills name="상담유형" options={TYPES} defaultValue="신규개원" />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend><em>03</em>매물 조건<small>선택 사항</small></legend>
          <div className="grid">
            <Select name="보증금" id="c-deposit" label="보증금" options={DEPOSIT} placeholder="선택" />
            <Select name="임대료" id="c-rent" label="임대료" options={RENT} placeholder="선택" />
            <Select name="시설비" id="c-facility" label="시설비" options={FACILITY} placeholder="선택" />
            <Select name="예상 연면적" id="c-floor" label="예상 연면적" options={AREA} placeholder="선택" />
            <div className="row full">
              <label className="lb">기존 시설 유무</label>
              <Pills name="시설유무" options={["있음", "없음"]} defaultValue="있음" />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend><em>04</em>요청사항</legend>
          <div className="row"><textarea name="say" id="c-say" ref={taRef} placeholder="관심 있는 매물, 궁금한 점, 희망 일정 등을 자유롭게 적어주세요"></textarea></div>
        </fieldset>

        <div className="foot">
          <label className="agree">
            <input id="c-agree" name="agree" type="checkbox" required />
            <span>개인정보 수집·이용에 동의합니다.</span>
            <a onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}>내용 보기</a>
          </label>
          <button type="submit" className="mr-btn" disabled={pending}>{pending ? "접수 중…" : "상담 신청하기"}</button>
        </div>

        <input type="hidden" name="listing" value={listing} />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      </form>
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </>
  );
}
