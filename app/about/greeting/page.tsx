import type { Metadata } from "next";
import SubTop from "@/components/layout/SubTop";
import CeoBlock from "@/components/about/CeoBlock";
import PhotoStrip from "@/components/ui/PhotoStrip";
import { content } from "@/lib/site";

export const metadata: Metadata = { title: "인사말" };

export default function GreetingPage() {
  const g = content.greeting;
  return (
    <>
      <SubTop en={g.en} title={g.title} desc={g.desc} />
      <CeoBlock />
      <section className="sub_con sec_white">
        <div className="wrap" style={{ maxWidth: 960 }}>
          <div className="tt taC"><em>MESSAGE</em><h4><b>원장님께 드리는 글</b></h4></div>
          <div className="mr-letter aos">
            <p>안녕하십니까. 메디로드 개원 컨설팅 대표 김상수입니다.</p>
            <p>병·의원 개원은 원장님 인생에서 가장 큰 투자이자 결정입니다. 좋은 진료 실력만으로는 부족하고, 어디에서 어떤 규모로 어떤 조건으로 시작하느냐가 이후 10년을 좌우합니다. 메디로드는 그 첫 단추인 <b>입지</b>를 데이터로 판단하고, 계약과 인허가, 시설, 마케팅까지 개원의 전 과정을 한 창구에서 연결하기 위해 만들어졌습니다.</p>
            <p>우리는 매물을 소개하는 데서 끝나지 않습니다. 후보 입지를 함께 걸으며 경쟁 병원과 환자 동선을 확인하고, 임대차 계약의 독소 조항을 원장님 편에서 점검하며, 개원 이후에도 경영과 마케팅을 지속 지원합니다.</p>
            <p>원장님의 개원이 안정적인 사업으로 성장할 수 있도록, 메디로드가 든든한 길잡이가 되겠습니다. 감사합니다.</p>
            <p className="sign">{g.signature}</p>
          </div>
        </div>
      </section>
      <PhotoStrip en="WITH YOU" title="메디로드가 함께하는 방식" items={g.strip} noTop />
    </>
  );
}
