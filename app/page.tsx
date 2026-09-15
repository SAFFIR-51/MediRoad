import HeroSlider from "@/components/home/HeroSlider";
import AnalysisMethod from "@/components/analysis/AnalysisMethod";
import ServicesSection from "@/components/home/ServicesSection";
import ListingsSection from "@/components/home/ListingsSection";
import PortfolioSection from "@/components/home/PortfolioSection";
import PartnersSection from "@/components/home/PartnersSection";
import ContactTeaser from "@/components/home/ContactTeaser";
import OpenPopup from "@/components/layout/OpenPopup";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/");

/**
 * 홈 섹션 순서: 히어로(분석 보드) → 입지 분석 방법(데이터 레이어) → 분야(입지 분석 3 · 개원 지원 3)
 * → 개원 실적 → 매물 정보(회원 전용·노출 설정) → 협력사 → 상담 안내
 */
export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <AnalysisMethod />
      <ServicesSection />
      <PortfolioSection />
      <ListingsSection />
      <PartnersSection />
      <ContactTeaser />
      <OpenPopup />
    </>
  );
}
