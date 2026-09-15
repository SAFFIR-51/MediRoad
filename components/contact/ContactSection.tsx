"use client";

/**
 * 상담신청 폼 (/contact/). 원본 sec_contact 마크업을 유지하고 PHP API(/api/inquiry.php)로 접수한다.
 * 접수된 문의는 관리자 > 상담 문의에서 확인한다.
 * 매물 문의는 이 폼이 아니라 매물 상세의 중개사무소 연락처로 받는다 (메디로드는 중개하지 않음).
 */
import { useState } from "react";
import Link from "next/link";
import { content, site } from "@/lib/site";
import { api, ApiError } from "@/lib/api";
import PrivacyModal from "@/components/ui/PrivacyModal";

type Step = { img: string; no?: string; title: string; desc: string };

const DEFAULT_TYPES = ["개원 입지 분석", "약국 개국 입지", "병원 양수·양도", "인증·인허가", "경영마케팅", "폐업 정리"];

export default function ContactSection({ steps = [] }: { steps?: Step[] }) {
  const c = site.home.contact;
  const types = (content as unknown as { contactForm?: { consultTypes?: string[] } }).contactForm?.consultTypes ?? DEFAULT_TYPES;
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [showPrivacy, setShowPrivacy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    if (!fd.get("agree")) {
      setError("개인정보 수집 및 이용에 동의해 주세요.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await api("inquiry.php", {
        body: {
          name: v("name"), phone: v("phone"), email: v("email"), department: v("department"), region: v("region"),
          openTiming: v("openTiming"), budget: v("budget"), deposit: v("deposit"), rent: v("rent"), facilityCost: v("facilityCost"),
          area: v("area"), facility: v("facility"), consultType: v("consultType"), message: v("message"), agree: true, website: v("website"),
        },
      });
      setDone(true);
      requestAnimationFrame(() => document.querySelector(".mr-done")?.scrollIntoView({ behavior: "smooth", block: "center" }));
    } catch (err) {
      const msg = err instanceof ApiError ? (err.errors ? Object.values(err.errors)[0] : err.message) : "접수하지 못했습니다. 잠시 후 다시 시도해 주세요.";
      setError(msg);
      requestAnimationFrame(() => document.querySelector(".sec_contact .mr-flash")?.scrollIntoView({ behavior: "smooth", block: "center" }));
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="sub_con sec_contact" id="contact">
      <div className="wrap">
        <div className="pic"><img src={c.image} alt="" /></div>
        <div className="tt wht">
          <div>
            <h3><span><b>{c.title}</b></span></h3>
            <h4 className="en">{c.en}</h4>
          </div>
          <p>{c.desc}</p>
        </div>
        <div className="con">
          {done ? (
            <div className="mr-done">
              <i className="xi-check-circle-o"></i>
              <h4>상담 신청이 접수되었습니다</h4>
              <p>담당자가 확인 후 1영업일 내 연락드리겠습니다. 급한 문의는 {site.contact.headerTel} 로 전화 주세요.</p>
              <div className="btns">
                <Link className="mr-btn" href="/">홈으로</Link>
                <Link className="mr-btn line" href="/analysis/">입지 분석 보기</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              {error ? <div className="mr-flash error" role="alert">{error}</div> : null}
              <div className="inner">
                <dl><dt><span>성함</span><i>*</i></dt><dd><input type="text" name="name" id="name1" placeholder="성함을 입력하세요" maxLength={50} required /></dd></dl>
                <dl><dt><span>연락처 (휴대폰번호)</span><i>*</i></dt><dd><input type="tel" name="phone" id="phone4_cc" placeholder="휴대폰번호를 입력하세요" maxLength={30} required /></dd></dl>
                <dl><dt><span>이메일 주소</span><i>*</i></dt><dd><input type="email" name="email" id="email2" placeholder="이메일주소를 입력하세요" maxLength={120} required /></dd></dl>
                <dl><dt><span>진료과목</span><i>*</i></dt><dd><input type="text" name="department" id="clinic" placeholder="진료과목을 알려주세요 (약국은 '약국')" maxLength={50} required /></dd></dl>
                <dl><dt><span>희망 지역</span><i>*</i></dt><dd><input type="text" name="region" id="area" placeholder="개원·개국을 희망하는 지역을 알려주세요" maxLength={100} required /></dd></dl>
                <dl><dt><span>개원·개국 예정 시기</span><i>*</i></dt><dd>
                  <select name="openTiming" id="date" required defaultValue="">
                    <option value="">예정 시기를 선택해주세요</option>
                    <option value="3개월 이내">3개월 이내</option>
                    <option value="6개월 이내">6개월 이내</option>
                    <option value="1년 이내">1년 이내</option>
                    <option value="1년 이후">1년 이후</option>
                    <option value="미정">아직 정하지 않음</option>
                  </select>
                </dd></dl>
                <dl><dt><span>자금 규모</span><i>*</i></dt><dd>
                  <select name="budget" id="money" required defaultValue="">
                    <option value="">자금 규모를 선택해주세요</option>
                    <option value="3억 미만">3억 미만</option>
                    <option value="3 ~ 5억">3 ~ 5억</option>
                    <option value="5억 이상">5억 이상</option>
                    <option value="미정">아직 정하지 않음</option>
                  </select>
                </dd></dl>
                <dl><dt><span>보증금</span><i></i></dt><dd>
                  <select name="deposit" id="deposit" defaultValue="">
                    <option value="">보증금을 선택해주세요 (선택사항)</option>
                    <option value="1억 미만">1억 미만</option>
                    <option value="1억~3억">1억~3억</option>
                    <option value="3억~5억">3억~5억</option>
                    <option value="5억 이상">5억 이상</option>
                  </select>
                </dd></dl>
                <dl><dt><span>임대료</span><i></i></dt><dd>
                  <select name="rent" id="rent" defaultValue="">
                    <option value="">임대료를 선택해주세요 (선택사항)</option>
                    <option value="1000만원 미만">1000만원 미만</option>
                    <option value="1000만원~2000만원">1000만원~2000만원</option>
                    <option value="2000만원 이상">2000만원 이상</option>
                  </select>
                </dd></dl>
                <dl><dt><span>시설비</span><i></i></dt><dd>
                  <select name="facilityCost" id="facility" defaultValue="">
                    <option value="">시설비를 선택해주세요 (선택사항)</option>
                    <option value="5천 이하">5천 이하</option>
                    <option value="5천~1억">5천~1억</option>
                    <option value="1억 이상">1억 이상</option>
                  </select>
                </dd></dl>
                <dl><dt><span>예상 연면적</span><i></i></dt><dd>
                  <select name="area" id="floorarea" defaultValue="">
                    <option value="">예상 연면적을 선택해주세요 (선택사항)</option>
                    <option value="30평 이하">30평 이하</option>
                    <option value="30평~100평">30평~100평</option>
                    <option value="100평~150평">100평~150평</option>
                    <option value="150평 이상">150평 이상</option>
                  </select>
                </dd></dl>
                <dl><dt><span>시설 유무</span><i></i></dt><dd>
                  <ul>
                    <li><input type="radio" name="facility" value="있음" id="surgery01" /> <label htmlFor="surgery01">있음</label></li>
                    <li><input type="radio" name="facility" value="없음" id="surgery02" defaultChecked /> <label htmlFor="surgery02">없음</label></li>
                  </ul>
                </dd></dl>
                <dl><dt><span>상담유형</span><i></i></dt><dd>
                  <ul>
                    {types.map((t, i) => (
                      <li key={t}><input type="radio" name="consultType" value={t} id={`cate${i}`} defaultChecked={i === 0} /> <label htmlFor={`cate${i}`}>{t}</label></li>
                    ))}
                  </ul>
                </dd></dl>
                <dl><dt><span>추가 요청사항</span><i></i></dt><dd><textarea className="ta" id="say2" name="message" maxLength={2000} placeholder="검토 중인 후보지 주소나 요청사항을 자유롭게 적어주세요"></textarea></dd></dl>
              </div>
              <div className="bottom">
                <div className="privacy">
                  <input id="agree" name="agree" type="checkbox" required /><label htmlFor="agree">개인정보처리방침에 동의합니다.</label>
                  <a onClick={() => setShowPrivacy(true)}>[ 개인정보처리방침 ]</a>
                </div>
                <button type="submit" disabled={pending}>{pending ? "접수 중…" : "상담 신청하기"}<i className="xi-long-arrow-right"></i></button>
              </div>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />
            </form>
          )}
        </div>
      </div>
      {steps.length > 0 && (
        <div className="wrap mr-csteps aos2">
          <div className="head"><em>PROCESS</em><h4>상담은 이렇게 진행됩니다</h4><p>접수부터 입지 분석 결과 정리까지, 세 단계로 답을 드립니다.</p></div>
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
