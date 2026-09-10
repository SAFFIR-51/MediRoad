import HeroSlider from "@/components/home/HeroSlider";
import MessageSection from "@/components/home/MessageSection";
import ValuesSection from "@/components/home/ValuesSection";
import ServicesSection from "@/components/home/ServicesSection";
import StepsSection from "@/components/home/StepsSection";
import ListingsSection from "@/components/home/ListingsSection";
import PortfolioSection from "@/components/home/PortfolioSection";
import ContactTeaser from "@/components/home/ContactTeaser";
import OpenPopup from "@/components/layout/OpenPopup";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <MessageSection />
      <ValuesSection />
      <ServicesSection />
      <StepsSection />
      <PortfolioSection />
      <ListingsSection />
      <ContactTeaser />
      <OpenPopup />
    </>
  );
}
