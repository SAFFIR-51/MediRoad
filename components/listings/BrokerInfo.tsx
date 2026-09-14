import { site } from "@/lib/site";

/**
 * 매물 표시·광고 명시사항 (공인중개사법 제18조의2 · 시행령 제17조의2).
 * 매물의 광고·중개 주체는 로드맵공인중개사사무소이고 메디로드는 중개하지 않는다는 점을 함께 밝힌다.
 * 값은 site.config.json broker — 중개사무소등록증과 똑같이 맞출 것.
 */
export default function BrokerInfo() {
  const b = site.broker;
  return (
    <div className="mr-broker">
      <h4>매물 정보 제공 · 중개</h4>
      <table>
        <tbody>
          <tr><th>중개사무소</th><td>{b.name}</td></tr>
          <tr><th>대표</th><td>{b.ceo}</td></tr>
          <tr><th>등록번호</th><td>{b.regNo}</td></tr>
          <tr><th>소재지</th><td>{b.address}</td></tr>
          <tr><th>연락처</th><td><a href={`tel:${b.tel}`}>{b.tel}</a></td></tr>
        </tbody>
      </table>
    </div>
  );
}

/** 목록·홈에 붙이는 한 줄 표기 */
export function BrokerLine() {
  const b = site.broker;
  return (
    <>
      매물 정보 제공: {b.name} (대표 {b.ceo} · 등록번호 {b.regNo} · {b.address} · {b.tel})
      <br />
      매물 문의·현장 안내·계약은 중개사무소에서 진행하며, {site.company.name}은 부동산 중개를 하지 않습니다.
    </>
  );
}
