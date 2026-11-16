import Link from "next/link";
import { ArrowRight, Clock3, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { getShopSettings } from "@/lib/shopDelivery";
import { formatRs, pricedPrintSizes, printFaqs, whatsappHref } from "@/lib/storefront";
import { t } from "@/lib/i18n";
import { getLang, pageMeta } from "@/lib/site";

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
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
        <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
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
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {[
            { href: "/photo-prints", title: copy.printsTitle, text: copy.printsText, meta: lang === "si" ? `රු. ${fromPrice.toLocaleString("en-LK")} සිට` : `From ${formatRs(fromPrice)}` },
            { href: "/packaging", title: copy.packTitle, text: copy.packText, meta: copy.packMeta },
            { href: "/craft", title: copy.craftTitle, text: copy.craftText, meta: copy.craftMeta },
          ].map((card) => (
            <Link key={card.href} href={card.href} className="surface-card p-5 no-underline">
              <h2 className="text-xl font-bold">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{card.text}</p>
              <p className="mt-4 text-sm font-bold">{card.meta}</p>
            </Link>
          ))}
        </section>

        <section>
          <h2 className="text-2xl font-bold">{copy.stepsTitle}</h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              [copy.step1, copy.step1Text],
              [copy.step2, copy.step2Text],
              [copy.step3, copy.step3Text],
            ].map(([title, text], index) => (
              <li key={title} className="surface-card p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-bold text-white">{index + 1}</span>
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold">{copy.pricesTitle}</h2>
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
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Clock3, text: copy.trustShip },
            { icon: ShieldCheck, text: copy.trustFile },
            { icon: Truck, text: fee },
            { icon: MessageCircle, text: copy.trustChat },
          ].map((item) => (
            <div key={item.text} className="rounded-[12px] bg-[var(--yellow-tint)] p-4">
              <item.icon size={18} />
              <p className="mt-2 text-sm leading-6">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="surface-card p-5">
            <h2 className="text-xl font-bold">{copy.galleryTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.galleryBody}</p>
          </div>
          <div className="surface-card p-5">
            <h2 className="text-xl font-bold">{copy.reviewTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.reviewBody}</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold">{copy.faqTitle}</h2>
          <div className="mt-4 grid gap-2">
            {faqs.map((faq) => (
              <details key={faq.question} className="surface-card p-4">
                <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
