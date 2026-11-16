import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Clock3, MessageCircle, Package, PackageSearch, Palette, ShieldCheck, Truck } from "lucide-react";
import HeroCarousel from "@/components/home/HeroCarousel";
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
  "Photo prints, packaging, and craft",
  "Upload photos to print in Sri Lanka from Rs 30. Packaging for online sellers and craft materials for home projects. Cash on delivery."
);

const previewIds = ["4x6", "5x7", "8x10", "a4", "passport-8"];

export default async function HomePage() {
  const [lang, delivery] = await Promise.all([getLang(), getShopSettings()]);
  const copy = t(lang).home;
  const prices = pricedPrintSizes(delivery.printPrices).filter((size) => previewIds.includes(size.id));
  const faqs = printFaqs(delivery.printPrices);
  const fromPrice = prices.find((size) => size.id === "4x6")?.price ?? 30;
  const fee =
    delivery.deliveryCharge > 0
      ? lang === "si"
        ? `රු. ${delivery.freeDeliveryAbove.toLocaleString("en-LK")}ට අඩු ඇණවුමක බෙදාහැරීම රු. ${delivery.deliveryCharge.toLocaleString("en-LK")}. ඊට වැඩි ඇණවුම් නොමිලේ.`
        : `Delivery is ${formatRs(delivery.deliveryCharge)} on orders under ${formatRs(delivery.freeDeliveryAbove)}. It is free above that.`
      : lang === "si"
        ? "බෙදාහැරීමේ ගාස්තුව කරත්තයේ පෙන්වයි."
        : "The cart shows the delivery fee before you pay.";

  return (
    <div>
      <HeroCarousel />
      <section className="border-t-8 border-[#F2B400] bg-white">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold text-[var(--muted)]">{copy.promise}</p>
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
          </div>
          <div className="surface-card grid grid-cols-2 gap-3 p-4" aria-hidden="true">
            {prices.slice(0, 4).map((size) => (
              <div key={size.id} className="rounded-[12px] bg-[var(--yellow-tint)] p-4">
                <p className="text-xs font-semibold text-[var(--muted)]">{size.cm}</p>
                <p className="mt-2 text-lg font-bold">{size.label}</p>
                <p className="mt-4 text-2xl font-bold">{formatRs(size.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-8 border-[#DE2684] bg-[#fff3c4]">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B10C53]">Shop</p>
          <h2 className="mt-2 text-3xl font-bold">Three things we sell</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            {
              href: "/photo-prints",
              title: copy.printsTitle,
              text: copy.printsText,
              meta: lang === "si" ? `රු. ${fromPrice.toLocaleString("en-LK")} සිට` : `From ${formatRs(fromPrice)}`,
              image: "/carousel-02.webp",
              icon: Camera,
              tone: "bg-[#DE2684] text-white",
            },
            {
              href: "/packaging",
              title: copy.packTitle,
              text: copy.packText,
              meta: copy.packMeta,
              image: "",
              icon: Package,
              tone: "bg-[#F2B400] text-[#111]",
            },
            {
              href: "/craft",
              title: copy.craftTitle,
              text: copy.craftText,
              meta: copy.craftMeta,
              image: "",
              icon: Palette,
              tone: "bg-[#681878] text-white",
            },
          ].map((card) => (
            <Link key={card.href} href={card.href} className="surface-card overflow-hidden p-0 no-underline">
              {card.image ? (
                <div className="relative h-40">
                  <Image src={card.image} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              ) : (
                <div className={`flex h-40 items-center justify-center ${card.tone}`}>
                  <card.icon size={42} />
                </div>
              )}
              <div className="p-5">
                <h2 className="text-xl font-bold">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{card.text}</p>
                <p className="mt-4 text-sm font-bold">{card.meta}</p>
              </div>
            </Link>
          ))}
          </div>
        </div>
      </section>

      <section className="border-t-8 border-[#00A36A] bg-[#fff8ee]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#00A36A]">Tracking</p>
            <h2 className="mt-2 text-3xl font-bold">{copy.trackTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.trackBody}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/track" className="btn-primary no-underline">
              <PackageSearch size={16} /> {copy.trackCta}
            </Link>
            <Link href="/login?callbackUrl=/dashboard" className="btn-secondary no-underline">
              {copy.trackLogin}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t-8 border-[#681878] bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#681878]">Order</p>
          <h2 className="mt-2 text-3xl font-bold">{copy.stepsTitle}</h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              [copy.step1, copy.step1Text],
              [copy.step2, copy.step2Text],
              [copy.step3, copy.step3Text],
            ].map(([title, text], index) => (
              <li key={title} className="surface-card p-4">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${index === 1 ? "bg-[#F2B400] text-[#111]" : index === 2 ? "bg-[#681878] text-white" : "bg-[#DE2684] text-white"}`}>{index + 1}</span>
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t-8 border-[#F2B400] bg-[#fff0f6]">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B10C53]">Prices</p>
          <h2 className="mt-2 text-3xl font-bold">{copy.pricesTitle}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {prices.map((size) => (
              <li key={size.id}>
                <Link href={`/photo-prints/order?size=${size.id}`} className="surface-card block p-4 no-underline">
                  <p className="font-bold">{size.label}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{size.cm}</p>
                  <p className="mt-3 text-2xl font-bold">{formatRs(size.price)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t-8 border-[#111] bg-[#2b1636] text-white">
        <div className="mx-auto grid w-full max-w-7xl gap-3 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: Clock3, text: copy.trustShip, tone: "bg-[#DE2684] text-white" },
            { icon: ShieldCheck, text: copy.trustFile, tone: "bg-[#00A36A] text-white" },
            { icon: Truck, text: fee, tone: "bg-[#F2B400] text-[#111]" },
            { icon: MessageCircle, text: copy.trustChat, tone: "bg-[#25D366] text-[#083018]" },
          ].map((item) => (
            <div key={item.text} className="rounded-[12px] bg-white/10 p-4">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${item.tone}`}>
                <item.icon size={18} />
              </span>
              <p className="mt-3 text-sm leading-6 text-white">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t-8 border-[#DE2684] bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B10C53]">Prints</p>
          <h2 className="mt-2 text-3xl font-bold">{copy.galleryTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.galleryBody}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {SAMPLE_PRINTS.map((photo) => (
              <Link key={photo.src} href="/photo-prints/order" className="relative block aspect-[4/3] overflow-hidden rounded-[12px]">
                <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 20vw" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-8 border-[#F2B400] bg-[#fff8ee]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-3xl font-bold">{copy.reviewTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.reviewBody}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CUSTOMER_REVIEWS.map((review) => (
              <article key={`${review.name}-${review.place}`} className="surface-card p-5">
                <p className="text-sm leading-6 text-[var(--ink)]">{lang === "si" ? review.textSi : review.textEn}</p>
                <p className="mt-4 text-sm font-bold">{review.name}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{review.place}</p>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold">{copy.faqTitle}</h2>
          <div className="mt-4 grid gap-2">
            {faqs.map((faq) => (
              <details key={faq.question} className="surface-card p-4">
                <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
