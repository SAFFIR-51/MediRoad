import Link from "next/link";
import { GROUPS, servicesIn, serviceHref, type ServiceGroup } from "@/lib/site";

/** 입지 분석(/analysis/) · 개원 지원(/support/) 소개 페이지의 분야 목록. 섹션 헤드(좌측 제목 · 우측 설명) + 분야별 사진 행. */
export default function FieldIndex({ group, intro }: { group: ServiceGroup; intro: { title: string; desc: string } }) {
  const g = GROUPS[group];
  const list = servicesIn(group);
  return (
    <section className="sub_con sec_fields">
      <div className="wrap">
        <div className="mr-fields-head">
          <div className="l aos">
            <em>{g.en}</em>
            <h4 dangerouslySetInnerHTML={{ __html: intro.title }} />
          </div>
          <div className="r aos2">
            <p dangerouslySetInnerHTML={{ __html: intro.desc }} />
            <span className="cnt"><b>{String(list.length).padStart(2, "0")}</b> 개 분야</span>
          </div>
        </div>
        <div className="mr-fields">
          {list.map((s, i) => {
            const bullets = (s.analysis?.items.map((a) => a.label) ?? s.points?.map((p) => p.title) ?? []).slice(0, 4);
            return (
              <div className="field aos" id={s.slug} key={s.slug}>
                <div className="pic"><img src={s.image} alt="" /><em>{String(i + 1).padStart(2, "0")}</em></div>
                <div className="txt">
                  <span>{s.en}</span>
                  <h4>{s.title}</h4>
                  <p>{s.desc.replace(/<[^>]+>/g, "")}</p>
                  {bullets.length ? <ul>{bullets.map((b) => <li key={b}>{b}</li>)}</ul> : null}
                  <Link className="mr-more" href={serviceHref(s)}>자세히 보기 <i className="xi-long-arrow-right"></i></Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
