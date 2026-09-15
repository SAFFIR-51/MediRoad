"use client";

/**
 * 홈 매물 정보 (회원 전용).
 *  - 로그인 회원: 지역·업종 검색바 + 최신 매물 6건 (/api/listings.php)
 *  - 비회원: 흐리게 처리한 카드 자리 위에 로그인·회원가입 안내
 * 관리자가 매물 메뉴를 끄면 섹션 전체가 .loc-only 로 숨는다. 매물은 중개사무소 명의로 표시한다.
 */
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { api, ApiError, loginHref } from "@/lib/api";
import { authFromHtml } from "@/lib/auth-client";
import { regionsOf, categoriesOf, type Listing } from "@/lib/listing-utils";
import ListingCard from "@/components/listings/ListingCard";
import LocationSearch from "@/components/home/LocationSearch";
import { BrokerLine } from "@/components/listings/BrokerInfo";

type State = { status: "loading" | "guest" | "ready" | "error"; items: Listing[] };

export default function ListingsSection() {
  const lc = site.home.location as { en: string; title: string; desc: string; more: string; lockedTitle?: string; lockedDesc?: string };
  const [state, setState] = useState<State>({ status: "loading", items: [] });

  useEffect(() => {
    if (authFromHtml() === "guest") {
      setState({ status: "guest", items: [] });
      return;
    }
    api<{ items: Listing[] }>("listings.php")
      .then((r) => setState({ status: "ready", items: r.items }))
      .catch((e: unknown) => setState({ status: e instanceof ApiError && e.status === 401 ? "guest" : "error", items: [] }));
  }, []);

  const { status, items } = state;

  return (
    <section className="main_con sec_pf loc-only" id="location">
      <div className="tt taC">
        <h4 className="en">{lc.en}</h4>
        <h3><span><b>{lc.title}</b></span></h3>
        <p>{lc.desc}</p>
      </div>
      <div className="wrap">
        {status === "ready" && items.length > 0 && (
          <>
            <LocationSearch regions={regionsOf(items)} categories={categoriesOf(items)} />
            <div className="mr-cards" id="home-listings">
              {items.slice(0, 6).map((l) => <ListingCard l={l} key={l.code} />)}
            </div>
          </>
        )}
        {status === "ready" && items.length === 0 && (
          <div className="mr-locked empty"><div className="box"><i className="xi-document"></i><h4>현재 게시 중인 매물이 없습니다</h4><p>원하시는 지역·진료과를 상담으로 알려주시면 입지 분석과 함께 검토해 드립니다.</p><div className="btns"><a className="mr-btn" href="/contact/">상담 신청</a></div></div></div>
        )}
        {(status === "loading" || status === "guest") && (
          <div className={`mr-locked${status === "loading" ? " loading" : ""}`}>
            <div className="ghost" aria-hidden="true">
              {Array.from({ length: 3 }, (_, i) => <div className="g" key={i}><span className="p" /><span className="l1" /><span className="l2" /></div>)}
            </div>
            {status === "guest" && (
              <div className="box">
                <i className="xi-lock-o"></i>
                <h4>{lc.lockedTitle || "매물 정보는 회원에게만 공개됩니다"}</h4>
                <p>{lc.lockedDesc || "로그인하시면 병·의원 임대·분양과 병원 매매 매물을 확인하실 수 있습니다."}</p>
                <div className="btns">
                  <a className="mr-btn" href={loginHref("/location/")}>로그인</a>
                  <a className="mr-btn line" href="/signup/?next=%2Flocation%2F">회원가입</a>
                </div>
              </div>
            )}
          </div>
        )}
        {status === "error" && <div className="mr-locked empty"><div className="box"><h4>매물 정보를 불러오지 못했습니다</h4><p>잠시 후 다시 시도해 주세요.</p></div></div>}
        <p className="mr-notice"><BrokerLine /></p>
      </div>
      {status === "ready" && items.length > 0 && (
        <a className="link aos" href={lc.more}>
          <span>매물 전체 보기</span>
          <i className="xi-long-arrow-right"></i>
        </a>
      )}
    </section>
  );
}
