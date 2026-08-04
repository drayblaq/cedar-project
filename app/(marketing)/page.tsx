import type { Metadata } from "next";
import HomePage from "@/components/marketing/HomePage";

export const metadata: Metadata = {
  title: "Cedar Training Center: English in Cotonou",
  description:
    "English language training in Cotonou, Bénin. General English, Business English, IELTS, TOEFL, TOEIC preparation and intensive programs.",
};

export default function MarketingHome() {
  return <HomePage />;
}
