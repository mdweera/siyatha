import type { Metadata } from "next";
import { Noto_Sans_Sinhala, Noto_Serif_Sinhala, Space_Grotesk, Sora } from "next/font/google";
import "./globals.css";
import React from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import OrderBar from "@/components/cart/OrderBar";
import Navbar from "@/components/Navbar";
import WelcomePopup from "@/components/WelcomePopup";
import UserTrackingProvider from "@/components/tracking/UserTrackingProvider";
import { Providers } from "./providers";
import Link from "next/link";
import Image from "next/image";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const notoSansSinhala = Noto_Sans_Sinhala({
  variable: "--font-sinhala",
  subsets: ["sinhala"],
});

const notoSerifSinhala = Noto_Serif_Sinhala({
  variable: "--font-sinhala-serif",
  subsets: ["sinhala"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://siyatha.lk"),
  title: {
    default: "Siyatha Online | Photo Print Sri Lanka, Packaging & Craft",
    template: "%s | Siyatha Online",
  },
  description:
    "Photo print in Sri Lanka, packaging for online sellers, and craft materials. Photo prints ship within one business day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="si"
      className={`${sora.variable} ${spaceGrotesk.variable} ${notoSansSinhala.variable} ${notoSerifSinhala.variable} h-full antialiased`}
    >
      <body className="site-shell flex min-h-full flex-col pb-24 text-slate-900">
        <Providers>
          <UserTrackingProvider />
          <Navbar />

          <main className="flex-grow flex flex-col">
            {children}
          </main>

          <WelcomePopup />

          <footer className="relative mt-auto overflow-hidden border-t border-cyan-200/40 bg-[#0B1533] text-slate-200 shrink-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(52,211,153,0.2),transparent_38%)]" />
            <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-2">
                  <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-2">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-cyan-200/50 bg-white">
                      <Image src="/siyatha-logo.jpg" alt="Siyatha logo" fill className="object-cover" sizes="32px" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Siyatha Online</p>
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                    සෑමවිටම හොඳම මිල ඔබට
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                    Photo prints, packaging for online sellers, and craft materials from Kirimatiya, Batapola, Ambalangoda.
                  </p>
                </div>

                <div>
                  <h4 className="font-display text-base font-semibold text-white">Explore</h4>
                  <ul className="mt-4 space-y-3 text-sm text-slate-300">
                    <li><Link href="/" className="hover:text-cyan-200 transition">Home</Link></li>
                    <li><Link href="/photo-prints" className="hover:text-cyan-200 transition">Photo prints</Link></li>
                    <li><Link href="/packaging" className="hover:text-cyan-200 transition">Packaging</Link></li>
                    <li><Link href="/craft" className="hover:text-cyan-200 transition">Craft materials</Link></li>
                    <li><Link href="/shop" className="hover:text-cyan-200 transition">Shop</Link></li>
                    <li><Link href="/who-are-we" className="hover:text-cyan-200 transition">Who Are We</Link></li>
                    <li><Link href="/cart" className="hover:text-cyan-200 transition">Cart</Link></li>
                    <li><Link href="/dashboard" className="hover:text-cyan-200 transition">My Dashboard</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-display text-base font-semibold text-white">Support</h4>
                  <ul className="mt-4 space-y-3 text-sm text-slate-300">
                    <li>WhatsApp: +94 76 660 9143</li>
                    <li>Kirimatiya, Batapola, Ambalangoda.</li>
                    <li>Mon - Sat: 9.00 AM - 7.00 PM</li>
                    <li className="text-cyan-200">සෑමවිටම හොඳම මිල ඔබට</li>
                    <li>
                      <a
                        href="https://www.facebook.com/profile.php?id=61587396941428"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-200 transition hover:text-cyan-100"
                      >
                        Facebook Page
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-10 border-t border-slate-700/70 pt-6 text-xs text-slate-400 sm:flex sm:items-center sm:justify-between">
                <p>© 2026 Siyatha Online. All rights reserved.</p>
                <p className="mt-3 sm:mt-0">Built for modern Sri Lankan eCommerce.</p>
              </div>
            </div>
          </footer>

          <OrderBar />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
