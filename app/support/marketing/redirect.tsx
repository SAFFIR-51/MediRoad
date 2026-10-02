"use client";
import { useEffect } from "react";

export default function MarketingRedirect() {
  useEffect(() => {
    window.location.replace(`/partners/marketing/${window.location.search}${window.location.hash}`);
  }, []);
  return null;
}
