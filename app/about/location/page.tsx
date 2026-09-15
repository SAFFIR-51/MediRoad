import SubTop from "@/components/layout/SubTop";
import PlaceMap from "@/components/ui/PlaceMap";
import { content, site, hasRealAddress, type Visual } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/about/location", { title: "오시는 길" });

export default function DirectionsPage() {
  const d = content.directions;
  const info = site.info;
  const real = hasRealAddress(info.address);
  return (
    <>
      <SubTop en={d.en} title={d.title} desc={d.desc} visual={((d as { visual?: Visual }).visual) || "map"} bg="about" />
      <section className="sub_con sec_dir sec_white">
        <div className="wrap">
          <div className="map aos"><PlaceMap address={info.address} real={real} label={info.name} /></div>
          <div className="grid">
            <div className="box aos2">
              <h5>{info.name}</h5>
              <dl><dt>주소</dt><dd>{info.address}</dd></dl>
              <dl><dt>전화</dt><dd>{info.tel}</dd></dl>
              <dl><dt>이메일</dt><dd>{info.email}</dd></dl>
              <div className="btns">
                <a href={`tel:${info.tel}`}><i className="xi-call"></i> 전화하기</a>
                <a className="line" href={`https://map.naver.com/p/search/${encodeURIComponent(info.address)}`} target="_blank" rel="noopener">네이버 지도</a>
                <a className="line" href={`https://map.kakao.com/link/search/${encodeURIComponent(info.address)}`} target="_blank" rel="noopener">카카오맵</a>
              </div>
            </div>
            <div className="box aos2">
              <h5>찾아오시는 방법</h5>
              {d.transport.map((t) => <dl key={t.label}><dt>{t.label}</dt><dd>{t.text}</dd></dl>)}
              <dl><dt>상담 시간</dt><dd>평일 09:00 ~ 18:00 (주말·공휴일 사전 예약)</dd></dl>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
