"use client";

/**
 * 상담신청 폼 (/contact). 원본 sec_contact 마크업/필드 구성 그대로. 서버 액션 submitConsult 와 필드명 동일.
 * 매물 상세에서 넘어오면 sessionStorage(mr_listing) 또는 ?listing= 값을 요청사항에 채운다.
 */
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { site } from "@/lib/site";
import { submitConsult } from "@/app/actions/consult";
import PrivacyModal from "@/components/ui/PrivacyModal";

type Step = { img: string; no?: string; title: string; desc: string };

export default function ContactSection({ sub = false, steps = [] }: { sub?: boolean; steps?: Step[] }) {
  const c = site.home.contact;
  const [state, action, pending] = useActionState(submitConsult, null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [listing, setListing] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
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
    const el = document.querySelector(state.ok ? ".mr-done" : ".sec_contact .mr-flash");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state]);

  // form action 대신 onSubmit 에서 직접 호출: 서버가 오류를 돌려줘도 입력값이 초기화되지 않는다 (React 19 form reset 회피)
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };

  // /contact 페이지에서는 폼이 스크롤 연출(.aos: 스크롤 전 opacity 0)에 가려지지 않도록 처음부터 표시
  const fade = sub ? "" : " aos";

  return (
    <section className={`${sub ? "sub_con" : "main_con"} sec_contact`} id="contact">
      <div className="wrap">
        <div className={`pic${fade}`}><img src={c.image} alt="" /></div>
        <div className="tt wht">
          <div>
            <h3><span><b>{c.title}</b></span></h3>
            <h4 className="en">{c.en}</h4>
          </div>
          <p>{c.desc}</p>
        </div>
        <div className={`con${fade}`}>
          {state?.ok ? (
            <div className="mr-done">
              <i className="xi-check-circle-o"></i>
              <h4>상담 신청이 접수되었습니다</h4>
              <p>담당자가 확인 후 1영업일 내 연락드리겠습니다. 급한 문의는 {site.contact.headerTel} 로 전화 주세요.</p>
              <div className="btns"><Link className="mr-btn" href="/">홈으로</Link><Link className="mr-btn line" href="/location">매물 보기</Link></div>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              {state && !state.ok && state.message ? <div className="mr-flash error" role="alert">{state.message}</div> : null}
              <div className="inner">
                <dl><dt><span>성함</span><i>*</i></dt><dd><input type="text" name="name" id="name1" placeholder="성함을 입력하세요" required /></dd></dl>
                <dl><dt><span>연락처 (휴대폰번호)</span><i>*</i></dt><dd><input type="text" name="phone" id="phone4_cc" placeholder="휴대폰번호를 입력하세요" required /></dd></dl>
                <dl><dt><span>이메일 주소</span><i>*</i></dt><dd><input type="text" name="이메일" id="email2" placeholder="이메일주소를 입력하세요" required /></dd></dl>
                <dl><dt><span>진료과목</span><i>*</i></dt><dd><input type="text" name="진료과목" id="clinic" placeholder="진료과목을 알려주세요" required /></dd></dl>
                <dl><dt><span>희망 개원 지역</span><i>*</i></dt><dd><input type="text" name="희망 개원 지역" id="area" placeholder="희망 개원 지역을 알려주세요" required /></dd></dl>
                <dl><dt><span>개원 예정 시기</span><i>*</i></dt><dd>
                  <select name="개원 예정 시기" id="date" required defaultValue="">
                    <option value="">개원 예정 시기를 선택해주세요</option>
                    <option value="3개월 이내">3개월 이내</option>
                    <option value="6개월 이내">6개월 이내</option>
                    <option value="1년 이후">1년 이후</option>
                  </select>
                </dd></dl>
                <dl><dt><span>자금 규모</span><i>*</i></dt><dd>
                  <select name="자금 규모" id="money" required defaultValue="">
                    <option value="">자금 규모를 선택해주세요</option>
                    <option value="3억 미만">3억 미만</option>
                    <option value="3 ~ 5억">3 ~ 5억</option>
                    <option value="5억 이상">5억 이상</option>
                  </select>
                </dd></dl>
                <dl><dt><span>보증금</span><i></i></dt><dd>
                  <select name="보증금" id="deposit" defaultValue="">
                    <option value="">보증금을 선택해주세요 (선택사항)</option>
                    <option value="1억~3억">1억~3억</option>
                    <option value="3억~5억">3억~5억</option>
                    <option value="5억 이상">5억 이상</option>
                  </select>
                </dd></dl>
                <dl><dt><span>임대료</span><i></i></dt><dd>
                  <select name="임대료" id="rent" defaultValue="">
                    <option value="">임대료를 선택해주세요 (선택사항)</option>
                    <option value="1000만원 미만">1000만원 미만</option>
                    <option value="1000만원~2000만원">1000만원~2000만원</option>
                    <option value="2000만원 이상">2000만원 이상</option>
                  </select>
                </dd></dl>
                <dl><dt><span>시설비</span><i></i></dt><dd>
                  <select name="시설비" id="facility" defaultValue="">
                    <option value="">시설비를 선택해주세요 (선택사항)</option>
                    <option value="5천 이하">5천 이하</option>
                    <option value="5천~1억">5천~1억</option>
                    <option value="1억 이상">1억 이상</option>
                  </select>
                </dd></dl>
                <dl><dt><span>예상 연면적</span><i></i></dt><dd>
                  <select name="예상 연면적" id="floorarea" defaultValue="">
                    <option value="">예상 연면적을 선택해주세요 (선택사항)</option>
                    <option value="100평 이하">100평 이하</option>
                    <option value="100평~150평">100평~150평</option>
                    <option value="150평 이상">150평 이상</option>
                  </select>
                </dd></dl>
                <dl><dt><span>시설 유무</span><i></i></dt><dd>
                  <ul>
                    <li><input type="radio" name="시설유무" value="있음" id="surgery01" defaultChecked /> <label htmlFor="surgery01">있음</label></li>
                    <li><input type="radio" name="시설유무" value="없음" id="surgery02" /> <label htmlFor="surgery02">없음</label></li>
                  </ul>
                </dd></dl>
                <dl><dt><span>상담유형</span><i></i></dt><dd>
                  <ul>
                    <li><input type="radio" name="상담유형" value="신규개원" id="cate01" defaultChecked /> <label htmlFor="cate01">신규개원</label></li>
                    <li><input type="radio" name="상담유형" value="병원양도" id="cate02" /> <label htmlFor="cate02">병원 양도</label></li>
                    <li><input type="radio" name="상담유형" value="병원양수" id="cate03" /> <label htmlFor="cate03">병원 양수</label></li>
                    <li><input type="radio" name="상담유형" value="약국개설" id="cate04" /> <label htmlFor="cate04">약국 개설</label></li>
                  </ul>
                </dd></dl>
                <dl><dt><span>추가 요청사항</span><i></i></dt><dd><textarea className="ta" id="say2" name="say" placeholder="요청사항을 자유롭게 적어주세요" ref={taRef}></textarea></dd></dl>
              </div>
              <div className="bottom">
                <div className="privacy">
                  <input id="agree" name="agree" type="checkbox" required /><label htmlFor="agree">개인정보처리방침에 동의합니다.</label>
                  <a onClick={() => setShowPrivacy(true)}>[ 개인정보처리방침 ]</a>
                </div>
                <button type="submit" disabled={pending}>{pending ? "접수 중…" : "상담 신청하기"}<i className="xi-long-arrow-right"></i></button>
              </div>
              <input type="hidden" name="listing" value={listing} />
              <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />
            </form>
          )}
        </div>
      </div>
      {steps.length > 0 && (
        <div className="wrap mr-csteps aos2">
          <div className="head"><em>PROCESS</em><h4>상담은 이렇게 진행됩니다</h4><p>접수부터 입지 투어까지, 세 단계로 빠르게 답을 드립니다.</p></div>
          <div className="list">
            {steps.map((st) => (
              <div className="item" key={st.title}>
                <div className="pic"><img src={st.img} alt={st.title} loading="lazy" /></div>
                <div className="txt">{st.no ? <em>{st.no}</em> : null}<h5>{st.title}</h5><p>{st.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </section>
  );
}
