import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock3, MapPin, PhoneCall, Truck } from "lucide-react";
import { SHOP_PHONE_DISPLAY, SHOP_PHONE_TEL, SHOP_PLACE } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Visit the shop",
  description: "Map and directions to Siyatha Online in Kirimatiya, Batapola, Ambalangoda.",
  alternates: { canonical: "/location", languages: { en: "/location?lang=en", si: "/location?lang=si" } },
};

const MAP_EMBED = "https://maps.google.com/maps?q=Kirimatiya%2C%20Batapola%2C%20Ambalangoda&z=14&output=embed";
const MAP_LINK = "https://maps.google.com/?q=Kirimatiya%2C+Batapola%2C+Ambalangoda";

export default function LocationPage() {
  return (
    <div className="bg-[var(--page)]">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/who-are-we" className="inline-flex items-center gap-2 text-sm font-semibold no-underline">
          <ArrowLeft size={16} /> About us
        </Link>

        <h1 className="mt-6 text-4xl font-bold text-[var(--ink)]">Visit the shop</h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-[var(--muted)]">
          We are in {SHOP_PLACE}. Orders can be collected here, and prints ship from this shop across the island.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-black/10">
          <iframe
            title="Siyatha Online shop map"
            src={MAP_EMBED}
            className="h-[360px] w-full sm:h-[440px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#681878]" />
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">Address</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{SHOP_PLACE}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-[#681878]" />
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">Phone / WhatsApp</p>
              <a
                href={`tel:${SHOP_PHONE_TEL}`}
                className="mt-1 block text-sm text-[var(--muted)] underline decoration-[#F2B400] underline-offset-4"
              >
                {SHOP_PHONE_DISPLAY}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#681878]" />
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">Open</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Mon–Sat, 9.00 AM – 7.00 PM</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={MAP_LINK} target="_blank" rel="noreferrer" className="btn-primary no-underline">
            <MapPin size={16} /> Open in Google Maps
          </a>
          <Link href="/shipping" className="btn-secondary no-underline">
            <Truck size={16} /> Delivery and shipping
          </Link>
        </div>
      </div>
    </div>
  );
}
