import type { Metadata } from "next";
import MarketingContact from "@/components/marketing/MarketingContact";

export const metadata: Metadata = {
  title: "Contact | Cedar Training Center",
  description: "Contact Cedar Training Center in Cotonou, Bénin: phone, email, hours and location.",
};

export default function ContactPage() {
  return <MarketingContact />;
}
