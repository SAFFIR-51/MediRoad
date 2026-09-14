import HeroSlider from "@/components/home/HeroSlider";
import ServicesSection from "@/components/home/ServicesSection";
import ListingsSection from "@/components/home/ListingsSection";
import PortfolioSection from "@/components/home/PortfolioSection";
import PartnersSection from "@/components/home/PartnersSection";
import ContactTeaser from "@/components/home/ContactTeaser";
import OpenPopup from "@/components/layout/OpenPopup";

/**
 * 홈 섹션 순서 (간소화): 히어로 → 컨설팅 분야 → 개원 실적 → 매물 정보(중개사무소 명의) → 협력사 → 상담 안내
 * 개원 프로세스는 컨설팅 소개 페이지에서 보여준다.
 */
export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <ServicesSection />
      <PortfolioSection />
      <ListingsSection />
      <PartnersSection />
      <ContactTeaser />
      <OpenPopup />
    </>
  );
}
