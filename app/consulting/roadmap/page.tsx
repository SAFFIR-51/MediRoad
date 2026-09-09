import type { Metadata } from "next";
import Link from "next/link";
import SubTop from "@/components/layout/SubTop";
import CtaSection from "@/components/ui/CtaSection";
import { roadmap } from "@/lib/site";
import { currentMember } from "@/lib/auth";

export const metadata: Metadata = { title: "개원 로드맵", description: "메디로드가 컨설팅 현장에서 쓰는 6단계 개원 체크리스트와 분야별 개원 타임라인 (회원 전용)" };

/** 대표님 자료(개원 Roadmap · 개원 타임라인). 비회원은 단계 제목과 요약만, 회원은 전체 체크리스트를 본다. */
export default async function RoadmapPage() {
  const member = await currentMember();
  const r = roadmap;
  return (
    <>
      <SubTop en={r.en} title={r.title} desc="입지 확정부터 가오픈까지, 메디로드의 6단계 개원 체크리스트" />
      <section className="sub_con sec_cintro">
        <div className="tt taC aos">
          <em>ROADMAP</em>
          <h4>개원, <b>순서대로 챙기면</b> 어렵지 않습니다</h4>
          <p>{r.desc}</p>
        </div>
      </section>

      <section className="sub_con sec_roadmap">
        <div className="wrap">
          <div className="tt taC">
            <em>6 STEPS</em>
            <h3><span><b>개원 Roadmap</b></span></h3>
            <p>{member ? "단계별 체크리스트입니다. 항목을 하나씩 확인하며 진행하세요." : "단계별 요약입니다. 세부 체크리스트는 회원에게 공개됩니다."}</p>
          </div>
          <div className="mr-roadmap aos">
            {r.steps.map((s) => (
              <div className={`step${member ? "" : " brief"}`} key={s.no}>
                <div className="head"><em>{s.no}</em><h5>{s.title}</h5></div>
                <p className="sum">{s.summary}</p>
                {member ? (
                  <div className="body">
                    {s.items.map((it) => (
                      <div className="grp" key={it.h}>
                        <h6>{it.h}</h6>
                        <ul>{it.p.map((p) => <li key={p}>{p}</li>)}</ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="lock"><i className="xi-lock"></i> 체크 항목 {s.items.reduce((n, it) => n + it.p.length, 0)}개 · 회원 전용</div>
                )}
              </div>
            ))}
          </div>
          {!member && (
            <div className="mr-gate">
              <i className="xi-lock"></i>
              <h4>전체 체크리스트는 회원에게 공개됩니다</h4>
              <p>회원가입은 무료입니다. 로그인하시면 단계별 세부 항목과 분야별 타임라인을 모두 보실 수 있습니다.</p>
              <div className="btns">
                <Link className="mr-btn" href="/member/login?next=%2Fconsulting%2Froadmap">로그인</Link>
                <Link className="mr-btn line" href="/member/join">회원가입</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="sub_con sec_timeline">
        <div className="wrap">
          <div className="tt taC">
            <em>TIMELINE</em>
            <h3><span><b>{r.timeline.title}</b></span></h3>
            <p>{r.timeline.desc}</p>
          </div>
          <div className="mr-timeline2 aos">
            {r.timeline.rows.map((row) => (
              <div className="row" key={row.label}>
                <div className="lb">{row.label}</div>
                <div className="items">
                  {member ? row.items.map((it) => <span key={it}>{it}</span>) : <span className="masked">{row.items.length}개 항목 · 회원 전용</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection title="체크리스트를 함께 진행할 파트너가 필요하신가요?" desc="메디로드가 로드맵의 모든 단계를 원장님 일정에 맞춰 관리합니다. 초기 상담은 무료입니다.">
        <Link href="/contact"><span>상담 신청하기</span><i className="xi-long-arrow-right"></i></Link>
        <Link className="line" href="/consulting"><span>개원컨설팅 보기</span><i className="xi-long-arrow-right"></i></Link>
      </CtaSection>
    </>
  );
}
