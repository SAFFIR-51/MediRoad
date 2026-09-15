"use client";

/**
 * 매물 상세. 표에는 인터넷 표시·광고 명시사항(소재지·면적·가격·용도·거래형태·층수·사용승인일·방향·주차·관리비·입주가능일, 위반건축물)을 보여주고,
 * 광고·중개 주체인 중개사무소 정보를 함께 표시한다. 매물 문의는 메디로드 상담 폼이 아니라 중개사무소로 연결한다.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SubTop from "@/components/layout/SubTop";
import ListingCard, { Badges } from "./ListingCard";
import Gallery from "./Gallery";
import BrokerInfo from "./BrokerInfo";
import { api, ApiError, loginHref } from "@/lib/api";
import { site } from "@/lib/site";
import { areaLabel, fmtDate, floorLabel, maintenanceLabel, parkingLabel, priceRows, tabOf, TAB_LABEL, type Listing } from "@/lib/listing-utils";

type State = { status: "loading" | "ready" | "notfound" | "error"; item?: Listing; related: Listing[] };

export default function ListingDetail() {
  const code = useSearchParams().get("code") ?? "";
  const [state, setState] = useState<State>({ status: "loading", related: [] });

  useEffect(() => {
    if (!code) {
      setState({ status: "notfound", related: [] });
      return;
    }
    setState({ status: "loading", related: [] });
    api<{ item: Listing; related: Listing[] }>(`listing.php?code=${encodeURIComponent(code)}`)
      .then((r) => {
        setState({ status: "ready", item: r.item, related: r.related ?? [] });
        document.title = `${r.item.title} | ${site.brand.name}`;
      })
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.status === 401) return window.location.replace(loginHref());
        if (e instanceof ApiError && e.status === 403) return window.location.replace("/");
        setState({ status: e instanceof ApiError && e.status === 404 ? "notfound" : "error", related: [] });
      });
  }, [code]);

  const l = state.item;
  if (state.status !== "ready" || !l) {
    return (
      <>
        <SubTop en="Listing" title={state.status === "loading" ? "매물 정보를 불러오는 중입니다" : "매물을 찾을 수 없습니다"} compact bg="location" />
        <section className="sub_con sec_white">
          <div className="wrap">
            {state.status === "loading" ? (
              <div className="mr-detail mr-skeleton" aria-busy="true"><div className="g big"><span className="p" /></div><div className="g"><span className="l1" /><span className="l2" /><span className="l2" /></div></div>
            ) : (
              <div className="mr-gate">
                <h4>{state.status === "notfound" ? "거래가 끝났거나 게시가 중단된 매물입니다." : "매물 정보를 불러오지 못했습니다."}</h4>
                <p>다른 매물을 확인하시거나, 원하시는 조건을 상담으로 알려주세요.</p>
                <div className="btns"><a className="mr-btn" href="/location/">매물 목록</a><Link className="mr-btn line" href="/contact/">상담 신청</Link></div>
              </div>
            )}
          </div>
        </section>
      </>
    );
  }

  const tab = tabOf(l.dealType);
  const b = site.broker;
  const rows: [string, React.ReactNode][] = [
    ["매물번호", l.code],
    ["거래형태", `${l.dealType} · ${l.category}`],
    ["소재지", l.address],
    ["건축물 용도", l.useType],
    ...(l.violation ? [["위반건축물", <b key="v" className="warn">위반건축물 (건축물대장 기재)</b>] as [string, React.ReactNode]] : []),
    ["면적", areaLabel(l.areaM2)],
    ["층수", floorLabel(l.floorCurrent, l.floorTotal)],
    ...priceRows(l),
    ["관리비", maintenanceLabel(l.maintenanceManwon)],
    ["방향", l.direction],
    ["주차대수", parkingLabel(l.parking)],
    ["사용승인일", fmtDate(l.approvalDate)],
    ["입주가능일", l.moveIn],
    ["등록일", fmtDate(l.createdAt)],
  ].filter(([, v]) => v !== "" && v != null) as [string, React.ReactNode][];

  return (
    <>
      <SubTop en={TAB_LABEL[tab]} title={l.title} desc={l.region} compact bg="location" />
      <section className="sub_con sec_detail">
        <div className="wrap">
          <a className="mr-back" href={`/location/?type=${tab}`}><i className="xi-long-arrow-left"></i> {TAB_LABEL[tab]} 목록으로</a>
          <div className="mr-detail">
            <div>
              <Gallery images={l.images} title={l.title} />
              <div className="mr-desc">
                <h4>매물 소개</h4>
                <p>{l.description}</p>
                <div className="note">이 매물 정보는 {b.name}가 의뢰받아 게시한 정보입니다. 매물 문의·현장 안내·계약은 중개사무소에서 진행하며, {site.company.name}은 부동산 중개를 하지 않습니다.</div>
              </div>
              <div className="mr-desc-cta">
                <div><em>SITE ANALYSIS</em><h5>이 자리, 진료과에 맞는지 먼저 분석해 보세요</h5><p>배후 세대·유동인구·경쟁 의료기관을 확인해 계약 전 판단 근거를 정리해 드립니다.</p></div>
                <Link className="mr-btn" href="/contact/">입지 분석 상담</Link>
              </div>
            </div>
            <aside className="mr-summary">
              <div className="badges"><Badges l={l} /></div>
              <h3>{l.title}</h3>
              <div className="region">{l.region}</div>
              <table><tbody>{rows.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody></table>
              {l.features.length ? <div className="tags">{l.features.map((f) => <span key={f}>{f}</span>)}</div> : null}
              <a className="btn" href={`tel:${b.tel}`}><span>중개사무소 전화 문의</span><i className="xi-call"></i></a>
              <BrokerInfo />
            </aside>
          </div>
          {state.related.length > 0 && (
            <div className="mr-related">
              <h4>함께 볼 만한 매물</h4>
              <div className="mr-cards">{state.related.map((o) => <ListingCard l={o} key={o.code} />)}</div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
