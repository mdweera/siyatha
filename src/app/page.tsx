import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, MessageCircle, Package, PackageSearch, Palette, ShieldCheck, Truck } from "lucide-react";
import HeroCarousel from "@/components/home/HeroCarousel";
import LoginButton from "@/components/auth/LoginButton";
import { getShopSettings } from "@/lib/shopDelivery";
import { CUSTOMER_REVIEWS } from "@/lib/customerReviews";
import { formatRs, pricedPrintSizes, printFaqs, whatsappHref } from "@/lib/storefront";
import { t } from "@/lib/i18n";
import { getLang, pageMeta } from "@/lib/site";

const SAMPLE_PRINTS = [
  { src: "/carousel-01.webp", alt: "Printed photos of family, travel, and pets on a wooden table" },
  { src: "/carousel-02.webp", alt: "Photo prints of children and a family standing at the beach" },
  { src: "/carousel-03.jpg", alt: "Photo print sizes from a 4 by 6 to a large family print" },
  { src: "/carousel-04.jpg", alt: "Birthday photo prints and a first birthday card" },
  { src: "/carousel-05.jpg", alt: "Framed beach photos beside loose prints on a shelf" },
  { src: "/carousel-06.jpg", alt: "A camera held ready to take a photo" },
];

export const dynamic = "force-dynamic";

export const metadata = pageMeta(
  "/",
  "Photo prints in Sri Lanka",
  "Upload photos to print in Sri Lanka from Rs 30. Packaging and craft materials are also in the shop. Cash on delivery."
);

const previewIds = ["4x6", "5x7", "8x10", "a4", "passport-8"];

export default async function HomePage() {
  const [lang, delivery] = await Promise.all([getLang(), getShopSettings()]);
  const copy = t(lang).home;
  const prices = pricedPrintSizes(delivery.printPrices).filter((size) => previewIds.includes(size.id));
  const faqs = printFaqs(delivery.printPrices).slice(0, 4);
  const fromPrice = prices.find((size) => size.id === "4x6")?.price ?? 30;
  const fee =
    delivery.deliveryCharge > 0
      ? lang === "si"
        ? `රු. ${delivery.freeDeliveryAbove.toLocaleString("en-LK")}ට අඩු ඇණවුමක බෙදාහැරීම රු. ${delivery.deliveryCharge.toLocaleString("en-LK")}.`
        : `Delivery ${formatRs(delivery.deliveryCharge)} under ${formatRs(delivery.freeDeliveryAbove)}. Free above that.`
      : lang === "si"
        ? "බෙදාහැරීමේ ගාස්තුව කරත්තයේ පෙන්වයි."
        : "Delivery fee shows in the cart before you pay.";

  return (
    <div className="bg-[var(--page)]">
      <HeroCarousel />

      {/* Photo prints — primary block */}
      <section className="bg-gradient-to-b from-white via-[#fffaf2] to-[#fff3c4]/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-semibold text-[#B10C53]">{copy.promise}</p>
              <h1 className="mt-3 max-w-xl text-4xl font-bold leading-tight text-[var(--ink)] sm:text-5xl">{copy.title}</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">{copy.body}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/photo-prints/order" className="btn-primary no-underline">
                  {copy.upload} <ArrowRight size={16} />
                </Link>
                <a href={whatsappHref("Hello Siyatha, I want to print photos.")} className="btn-whatsapp no-underline" target="_blank" rel="noreferrer">
                  <MessageCircle size={16} /> {copy.whatsapp}
                </a>
              </div>

              <ol className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  [copy.step1, copy.step1Text],
                  [copy.step2, copy.step2Text],
                  [copy.step3, copy.step3Text],
                ].map(([title, text], index) => (
                  <li key={title} className="rounded-2xl bg-white/80 p-4 ring-1 ring-[#F2B400]/25">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F2B400] text-xs font-bold text-[#111]">
                      {index + 1}
                    </span>
                    <h2 className="mt-2 text-sm font-bold">{title}</h2>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{text}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <p className="text-sm font-semibold text-[var(--muted)]">{copy.pricesTitle}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {prices.map((size) => (
                  <Link
                    key={size.id}
                    href={`/photo-prints/order?size=${size.id}`}
                    className="rounded-2xl bg-white p-4 no-underline shadow-sm ring-1 ring-black/5 transition hover:ring-[#F2B400]/50"
                  >
                    <p className="text-xs font-semibold text-[var(--muted)]">{size.cm}</p>
                    <p className="mt-1 font-bold">{size.label}</p>
                    <p className="mt-3 text-xl font-bold">{formatRs(size.price)}</p>
                  </Link>
                ))}
              </div>
              <p className="mt-3 text-sm text-[var(--muted)]">
                {lang === "si" ? `රු. ${fromPrice.toLocaleString("en-LK")} සිට` : `From ${formatRs(fromPrice)}`} ·{" "}
                <Link href="/photo-prints" className="font-semibold underline">
                  {copy.printsTitle}
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">{copy.galleryTitle}</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.galleryBody}</p>
              </div>
              <Link href="/photo-prints/order" className="text-sm font-semibold underline">
                {copy.upload}
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {SAMPLE_PRINTS.map((photo) => (
                <Link key={photo.src} href="/photo-prints/order" className="relative block aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 16vw" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Clock3, text: copy.trustShip },
              { icon: ShieldCheck, text: copy.trustFile },
              { icon: Truck, text: fee },
              { icon: MessageCircle, text: copy.trustChat },
            ].map((item) => (
              <div key={item.text} className="flex gap-3 rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F2B400] text-[#111]">
                  <item.icon size={18} />
                </span>
                <p className="text-sm leading-6 text-[var(--ink)]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Soft secondary: packaging + craft */}
      <section className="border-t border-[#F2B400]/25 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-[var(--muted)]">{copy.moreTitle}</p>
          <h2 className="mt-2 text-2xl font-bold">{copy.moreBody}</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              {
                href: "/packaging",
                title: copy.packTitle,
                text: copy.packText,
                meta: copy.packMeta,
                icon: Package,
                tone: "bg-[#F2B400] text-[#111]",
              },
              {
                href: "/craft",
                title: copy.craftTitle,
                text: copy.craftText,
                meta: copy.craftMeta,
                icon: Palette,
                tone: "bg-[#681878] text-white",
              },
            ].map((card) => (
              <Link key={card.href} href={card.href} className="flex gap-4 rounded-2xl bg-[var(--page)] p-4 no-underline ring-1 ring-black/5 transition hover:ring-[#DE2684]/30">
                <span className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.tone}`}>
                  <card.icon size={22} />
                </span>
                <span className="min-w-0">
                  <span className="block text-lg font-bold text-[var(--ink)]">{card.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{card.text}</span>
                  <span className="mt-2 block text-sm font-semibold text-[var(--ink)]">{card.meta}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Soft help band: track + reviews + faq */}
      <section className="border-t border-[#681878]/15 bg-gradient-to-b from-[#fff8ee] to-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold text-[#681878]">{copy.helpTitle}</p>
            <h2 className="mt-2 text-2xl font-bold">{copy.trackTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.trackBody}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/track" className="btn-primary no-underline">
                <PackageSearch size={16} /> {copy.trackCta}
              </Link>
              <LoginButton className="btn-secondary">{copy.trackLogin}</LoginButton>
            </div>

            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-bold">{copy.faqTitle}</h3>
              {faqs.map((faq) => (
                <details key={faq.question} className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                  <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold">{copy.reviewTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.reviewBody}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {CUSTOMER_REVIEWS.slice(0, 4).map((review) => (
                <article key={`${review.name}-${review.place}`} className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
                  <p className="text-sm leading-6 text-[var(--ink)]">{lang === "si" ? review.textSi : review.textEn}</p>
                  <p className="mt-4 text-sm font-bold">{review.name}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{review.place}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
