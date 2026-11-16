import type { Metadata } from "next";
import { Noto_Sans_Sinhala, Sora } from "next/font/google";
import "./globals.css";
import React from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import Navbar from "@/components/Navbar";
import WelcomePopup from "@/components/WelcomePopup";
import UserTrackingProvider from "@/components/tracking/UserTrackingProvider";
import { Providers } from "./providers";
import { LanguageProvider } from "@/components/LanguageProvider";
import ShippingNotice from "@/components/ShippingNotice";
import OrderBar from "@/components/cart/OrderBar";
import PrintPriceSync from "@/components/PrintPriceSync";
import SiteFooter from "@/components/SiteFooter";
import { getLang } from "@/lib/site";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const notoSansSinhala = Noto_Sans_Sinhala({
  variable: "--font-sinhala",
  subsets: ["sinhala"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://siyatha.lk"),
  title: {
    default: "Siyatha Online | Photo Print Sri Lanka, Packaging & Craft",
    template: "%s | Siyatha Online",
  },
  description:
    "Photo print in Sri Lanka from Rs 30, packaging for online sellers, and craft materials. Cash on delivery and bank transfer.",
  alternates: {
    canonical: "/",
    languages: {
      en: "/?lang=en",
      si: "/?lang=si",
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLang();

  return (
    <html lang={lang} className={`${sora.variable} ${notoSansSinhala.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[var(--page)] pb-32 text-[var(--ink)]">
        <Providers>
          <LanguageProvider lang={lang}>
            <UserTrackingProvider />
            <PrintPriceSync />
            <ShippingNotice />
            <Navbar />
            <main className="flex flex-grow flex-col">{children}</main>
            <WelcomePopup />
            <SiteFooter />
            <OrderBar />
            <WhatsAppButton />
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
