/** 파트너 분야 페이지의 "상담 준비" 항목. 업체 소개·실적은 확인된 내용만 사용한다. */
export type PartnerPreparation = { title: string; desc: string }[];

export const partnerPreparation: Record<string, PartnerPreparation> = {
  "consulting": [
    { title: "진료 계획", desc: "진료과, 주요 진료 항목과 생각하고 계신 병원의 방향" },
    { title: "지역과 예산", desc: "희망 지역, 검토 중인 후보지와 전체 준비 예산" },
    { title: "현재 준비 단계", desc: "목표 개원 시기와 이미 결정했거나 고민 중인 사항" },
  ],
  "marketing": [
    { title: "병원의 방향", desc: "주요 진료 항목, 알리고 싶은 강점과 목표 환자층" },
    { title: "현재 운영 채널", desc: "홈페이지, 지도, 블로그·SNS 등 사용 중인 채널" },
    { title: "일정과 예산", desc: "개원·홍보 시작 시점, 월 예산과 우선 목표" },
  ],
  "interior": [
    { title: "현장 자료", desc: "주소, 전용 면적, 평면도와 현장 사진" },
    { title: "공간 요구 사항", desc: "진료실 수, 주요 장비와 대기·수납·직원 공간 계획" },
    { title: "예산과 공사 일정", desc: "입주 가능일, 공사 예산과 목표 개원일" },
  ],
  "equipment": [
    { title: "장비 목록", desc: "예정 진료와 필수·추가 도입을 검토 중인 장비" },
    { title: "설치 공간", desc: "평면도, 반입 동선과 확인 가능한 전원·시설 조건" },
    { title: "구매 조건", desc: "예산, 희망 납기와 기존에 받은 견적·제품 사양" },
  ],
  "supplies": [
    { title: "필요 품목", desc: "진료별 소모품 목록, 선호 규격·브랜드와 기존 사용 제품" },
    { title: "사용량과 보관", desc: "예상 사용량, 보관 공간과 현재 재고" },
    { title: "주문·배송 조건", desc: "첫 입고 희망일, 주문 단위와 정기 보충 주기" },
  ],
  "waste": [
    { title: "종류와 발생량", desc: "진료 과정에서 발생하는 폐기물 종류와 예상량" },
    { title: "보관·수거 환경", desc: "보관 공간, 수거 차량 접근과 현장 이동 동선" },
    { title: "기존 계약·희망 일정", desc: "현재 처리 방식, 계약 만료일과 희망 수거 주기" },
  ],
  "real-estate": [
    { title: "희망 입지", desc: "진료과, 관심 지역과 검토 중인 후보 매물" },
    { title: "공간·비용 조건", desc: "희망 면적·층수, 보증금·임대료 또는 매매 예산" },
    { title: "입주 계획", desc: "입주 가능 시기, 공사 계획과 목표 개원일" },
  ],
};
