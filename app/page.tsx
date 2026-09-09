import { Suspense } from "react";
import HeroSlider from "@/components/home/HeroSlider";
import MessageSection from "@/components/home/MessageSection";
import ValuesSection from "@/components/home/ValuesSection";
import HistorySection from "@/components/home/HistorySection";
import ServicesSection from "@/components/home/ServicesSection";
import StepsSection from "@/components/home/StepsSection";
import ExpertSection from "@/components/home/ExpertSection";
import ListingsSection from "@/components/home/ListingsSection";
import ContactSection from "@/components/home/ContactSection";
import OpenPopup from "@/components/layout/OpenPopup";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <MessageSection />
      <ValuesSection />
      <HistorySection />
      <ServicesSection />
      <StepsSection />
      <ExpertSection />
      <ListingsSection />
      <Suspense fallback={null}><ContactSection /></Suspense>
      <OpenPopup />
    </>
  );
}
