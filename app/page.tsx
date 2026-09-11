import HeroSlider from "@/components/home/HeroSlider";
import MessageSection from "@/components/home/MessageSection";
import ValuesSection from "@/components/home/ValuesSection";
import ServicesSection from "@/components/home/ServicesSection";
import StepsSection from "@/components/home/StepsSection";
import ListingsSection from "@/components/home/ListingsSection";
import PortfolioSection from "@/components/home/PortfolioSection";
import ContactTeaser from "@/components/home/ContactTeaser";
import OpenPopup from "@/components/layout/OpenPopup";

/**
 * 홈 섹션 순서: 히어로 → 추천 개원지(지역·업종 검색) → 컨설팅 분야 → 개원 프로세스
 *              → 3대 가치 → 개원 실적 → 브랜드 메시지 → 상담 안내
 * 자사 강점(입지 매물·실적)을 앞에 두고, 브랜드 메시지는 실적 뒤에서 마무리하는 흐름이다.
 */
export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <ListingsSection />
      <ServicesSection />
      <StepsSection />
      <ValuesSection />
      <PortfolioSection />
      <MessageSection />
      <ContactTeaser />
      <OpenPopup />
    </>
  );
}
