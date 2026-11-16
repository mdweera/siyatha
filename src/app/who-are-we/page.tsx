import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, MapPin, MessageCircle, PhoneCall, Truck } from "lucide-react";
import { SHOP_PHONE_DISPLAY, SHOP_PHONE_TEL, SHOP_PLACE, whatsappHref } from "@/lib/storefront";

export const metadata = {
  title: "About us",
  description:
    "Siyatha Online prints photos, sells packaging for online sellers, and stocks craft materials in Kirimatiya, Batapola.",
  alternates: { canonical: "/who-are-we", languages: { en: "/who-are-we?lang=en", si: "/who-are-we?lang=si" } },
};

const MAP_EMBED = "https://maps.google.com/maps?q=Kirimatiya%2C%20Batapola%2C%20Ambalangoda&z=13&output=embed";
const MAP_LINK = "https://maps.google.com/?q=Kirimatiya%2C+Batapola%2C+Ambalangoda";

const VALUES = [
  { title: "Fair pricing", text: "Photo print prices stay on the page, so you can check the cost before you upload." },
  { title: "Support that answers", text: "Phone and WhatsApp stay open after you order. We message first if a file will crop badly." },
  { title: "Made for local sellers", text: "Mailers, boxes, tape, and craft supplies chosen for people who sell and make at home." },
];

export default function WhoAreWePage() {
  return (
    <div className="bg-[var(--page)]">
      <section className="bg-gradient-to-b from-[#fff3c4]/70 via-[#fff8ee] to-[var(--page)]">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="relative h-12 w-12 overflow-hidden rounded-[14px] bg-white ring-1 ring-black/5">
              <Image src="/logo.jpg" alt="" fill className="object-cover" sizes="48px" priority />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight text-[var(--ink)]">Siyatha Online</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">About us</p>
            </div>
          </div>

          <h1 className="mt-8 max-w-3xl text-4xl font-bold leading-tight text-[var(--ink)] sm:text-5xl">
            We print photos, pack online orders, and stock craft materials.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)]">
            Send a picture and we print it. Buy mailers and boxes for the parcels you sell. Pick up paper, glue, and sewing
            supplies for home projects. We work from Kirimatiya, Batapola, and courier across Sri Lanka — or you can collect at the shop.
          </p>
          <p className="font-sinhala mt-4 text-xl font-bold leading-[1.85] text-[var(--ink)]">සෑමවිටම හොඳම මිල ඔබට</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/photo-prints/order" className="btn-primary no-underline">
              Send photos <ArrowRight size={16} />
            </Link>
            <a href={whatsappHref("Hello Siyatha, I have a question.")} className="btn-whatsapp no-underline" target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61587396941428"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[#1877F2] px-4 py-2 text-sm font-bold text-white no-underline hover:bg-[#166fe5]"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">
                <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.4V9.84c0-2.37 1.4-3.68 3.56-3.68 1.03 0 2.11.18 2.11.18v2.32h-1.19c-1.17 0-1.54.73-1.54 1.48v1.78h2.62l-.42 2.9h-2.2V22c4.78-.75 8.44-4.91 8.44-9.93z" />
              </svg>
              Facebook page
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-[#F2B400]/20">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">How we work</h2>
          <div className="mt-6 divide-y divide-[#CD7DA2]/25">
            {VALUES.map((item) => (
              <div key={item.title} className="grid gap-2 py-6 sm:grid-cols-[14rem_1fr] sm:gap-6">
                <h3 className="text-base font-bold text-[var(--ink)]">{item.title}</h3>
                <p className="text-sm leading-7 text-[var(--muted)]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#F2B400]/20 bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Find the shop</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{SHOP_PLACE}.</p>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_18rem]">
            <div className="overflow-hidden rounded-2xl ring-1 ring-black/10">
              <iframe
                title="Siyatha Online location map"
                src={MAP_EMBED}
                className="h-[320px] w-full sm:h-[380px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#681878]" />
                <div>
                  <p className="font-semibold text-[var(--ink)]">Address</p>
                  <p className="text-[var(--muted)]">{SHOP_PLACE}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-[#681878]" />
                <div>
                  <p className="font-semibold text-[var(--ink)]">Phone / WhatsApp</p>
                  <a href={`tel:${SHOP_PHONE_TEL}`} className="text-[var(--muted)] underline decoration-[#F2B400] underline-offset-4">
                    {SHOP_PHONE_DISPLAY}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#681878]" />
                <div>
                  <p className="font-semibold text-[var(--ink)]">Open</p>
                  <p className="text-[var(--muted)]">Mon–Sat, 9.00 AM – 7.00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#681878]" />
                <div>
                  <p className="font-semibold text-[var(--ink)]">Delivery</p>
                  <p className="text-[var(--muted)]">Deliver across Sri Lanka</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Link href="/location" className="btn-secondary no-underline">
                  <MapPin size={16} /> Map page
                </Link>
                <a href={MAP_LINK} target="_blank" rel="noreferrer" className="btn-primary no-underline">
                  Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
