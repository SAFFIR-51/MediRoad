"use client";

/** 매물 목록 본문: API 로 매물을 불러와 유형 탭·지역·업종 필터를 붙인다. 세션이 끊겼으면 로그인으로, 메뉴가 꺼졌으면 홈으로 보낸다. */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ListingBrowser from "./ListingBrowser";
import { BrokerLine } from "./BrokerInfo";
import { api, ApiError, loginHref } from "@/lib/api";
import { site } from "@/lib/site";
import type { Listing, Tab } from "@/lib/listing-utils";

export default function LocationList() {
  const sp = useSearchParams();
  const q = sp.get("type");
  const type: Tab = q === "lease" || q === "sale" ? q : "all";
  const [state, setState] = useState<{ status: "loading" | "ready" | "error"; items: Listing[]; message?: string }>({ status: "loading", items: [] });

  useEffect(() => {
    api<{ items: Listing[] }>("listings.php")
      .then((r) => setState({ status: "ready", items: r.items }))
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.status === 401) return window.location.replace(loginHref());
        if (e instanceof ApiError && e.status === 403) return window.location.replace("/");
        setState({ status: "error", items: [], message: e instanceof Error ? e.message : "" });
      });
  }, []);

  return (
    <div className="mr-loc-dark">
      <section className="sub_con sec_list" id="list">
        <div className="wrap">
          {state.status === "ready" ? (
            <ListingBrowser items={state.items} initialType={type} initialRegion={sp.get("region") ?? ""} initialCat={sp.get("cat") ?? ""} />
          ) : state.status === "loading" ? (
            <div className="mr-cards mr-skeleton" aria-busy="true">{Array.from({ length: 6 }, (_, i) => <div className="g" key={i}><span className="p" /><span className="l1" /><span className="l2" /></div>)}</div>
          ) : (
            <div className="mr-empty show">매물 정보를 불러오지 못했습니다. {state.message}</div>
          )}
          <p className="mr-notice"><BrokerLine /></p>
          <div className="mr-loc-cta">
            <div>
              <em>SITE ANALYSIS</em>
              <h4>마음에 드는 자리가 있다면, 계약 전에 입지부터 확인하세요</h4>
              <p>후보지 주소와 진료과를 알려주시면 배후 수요·유동인구·경쟁 의료기관을 분석해 판단 근거를 정리해 드립니다.</p>
            </div>
            <div className="btns">
              <Link href="/contact/"><span>입지 분석 상담 신청</span><i className="xi-long-arrow-right"></i></Link>
              <a className="line" href={`tel:${site.contact.headerTel}`}><span>전화 상담 {site.contact.headerTel}</span><i className="xi-call"></i></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
