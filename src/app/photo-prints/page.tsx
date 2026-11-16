import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, CreditCard, Frame, IdCard } from "lucide-react";
import {
  FINISHES,
  PRINT_FAMILIES,
  printFaqs,
  SHOP_PHONE_DISPLAY,
  SITE_URL,
  formatRs,
  lowestFamilyPrice,
  pricedPrintSizes,
  sizesForFamily,
  whatsappHref,
} from "@/lib/storefront";
import { getShopSettings } from "@/lib/shopDelivery";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "/photo-prints",
  "Photo print Sri Lanka",
  "Photo prints in Sri Lanka from Rs 30. Send 4×6 prints, enlargements, passport sheets, and cards. Ships in one business day."
);

export default async function PhotoPrintsPage() {
  const shop = await getShopSettings();
  const sizes = pricedPrintSizes(shop.printPrices);
  const bulk = shop.printPrices;
  const faqs = printFaqs(shop.printPrices);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "Photo print Sri Lanka",
        serviceType: "Photo printing",
        url: `${SITE_URL}/photo-prints`,
        areaServed: { "@type": "Country", name: "Sri Lanka" },
        provider: {
          "@type": "LocalBusiness",
          name: "Siyatha Online",
          telephone: SHOP_PHONE_DISPLAY,
          address: {
            "@type": "PostalAddress",
            addressCountry: "LK",
          },
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto flex w-full max-w-7xl flex-col [&>section]:border-t-8 [&>section]:border-[#F2B400] [&>section]:px-4 [&>section]:py-12 [&>section]:sm:px-6 [&>section]:lg:px-8 [&>section:nth-child(even)]:border-[#DE2684] [&>section:nth-child(even)]:bg-white [&>section:nth-child(odd)]:bg-[#fff8ee]">
        <section className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-card rounded-[2rem] p-6 sm:p-8">
            <p className="text-sm text-slate-500">Home / Photo prints</p>
            <p className="vibrant-chip mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
              Photo print Sri Lanka
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
              Send your photos. We ship the prints within{" "}
              <span className="mx-1 inline-flex h-10 w-10 translate-y-[-2px] items-center justify-center rounded-full bg-[#681878] align-middle text-2xl font-black text-white sm:h-11 sm:w-11 sm:text-3xl">
                1
              </span>{" "}
              business day.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
              Standard copies, enlargements, passport sheets, and photo cards on lustre, glossy, or matte paper.
              A photo order placed on a working day is shipped the same business day, then the courier takes it across Sri Lanka.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/photo-prints/order" className="btn-primary no-underline">
                Send photos <ArrowRight size={16} />
              </Link>
              <a
                href={whatsappHref("Hello Siyatha, I want a photo print quote.")}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp no-underline"
              >
                WhatsApp a quote
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-[1.5rem]">
              <Image src="/carousel-01.webp" alt="Printed photos of family, travel, and pets" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" priority />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem]">
              <Image src="/carousel-04.jpg" alt="Birthday photo prints" fill className="object-cover" sizes="20vw" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem]">
              <Image src="/carousel-03.jpg" alt="Photo print sizes laid out on a table" fill className="object-cover" sizes="20vw" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl font-bold text-slate-900">Start with a size</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            These are the prints people order first. The price is per picture, and the order page shows the total before you pay.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {["4x6", "5x7", "passport-8", "8x10"].map((id) => {
              const size = sizes.find((item) => item.id === id);
              if (!size) {
                return null;
              }
              return (
                <Link
                  key={size.id}
                  href={`/photo-prints/order?size=${size.id}`}
                  className="surface-card flex flex-col rounded-[1.5rem] p-5 transition hover:-translate-y-0.5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B10C53]">{size.cm}</p>
                  <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">{size.label}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{size.blurb}</p>
                  <p className="mt-4 font-display text-3xl font-black text-slate-900">{formatRs(size.price)}</p>
                  <p className="mt-1 text-xs text-slate-500">Sharp from about {size.pixels}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl font-bold text-slate-900">Choose a print</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Four ways people print. Each one opens with its sizes, and the price per picture is on the card.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {PRINT_FAMILIES.map((family) => {
              const from = lowestFamilyPrice(family.id, sizes);
              const first = sizesForFamily(family.id, sizes)[0];
              const icon = family.id === "enlargements" ? Frame : family.id === "passport" ? IdCard : family.id === "cards" ? CreditCard : Camera;
              const tone = family.id === "enlargements" ? "bg-[#681878] text-white" : family.id === "passport" ? "bg-[#F2B400] text-[#111]" : family.id === "cards" ? "bg-[#B10C53] text-white" : "bg-[#DE2684] text-white";
              const Icon = icon;
              return (
                <Link
                  key={family.id}
                  href={`/photo-prints/order?family=${family.id}${first ? `&size=${first.id}` : ""}`}
                  className="surface-card group overflow-hidden rounded-[1.75rem] no-underline transition hover:-translate-y-0.5"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={family.image}
                      alt={family.imageAlt}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 45vw"
                    />
                    <span className={`absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm ${tone}`}>
                      <Icon size={20} />
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B10C53]">From {formatRs(from)}</p>
                    <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">{family.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{family.text}</p>
                    <p className="mt-4 text-sm font-semibold text-[#B10C53]">See the sizes <ArrowRight className="inline" size={14} /></p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-card rounded-[1.75rem] p-5 sm:p-6">
            <h2 className="font-display text-2xl font-bold text-slate-900">Photo print prices</h2>
            <p className="mt-2 text-sm text-slate-600">Per print, in Sri Lankan rupees. Paper finish does not change the price.</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-[12px] bg-[var(--page)] p-3">
                <p className="font-bold">1–{bulk.bulk12Copies - 1}</p>
                <p className="text-[var(--muted)]">List price</p>
              </div>
              <div className="rounded-[12px] bg-[var(--yellow-tint)] p-3">
                <p className="font-bold">{bulk.bulk12Copies}+</p>
                <p>{bulk.bulk12Percent}% less</p>
              </div>
              <div className="rounded-[12px] bg-[var(--yellow)] p-3">
                <p className="font-bold">{bulk.bulk30Copies}+</p>
                <p>{bulk.bulk30Percent}% less</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 sm:hidden">
              {sizes.map((size) => (
                <li key={size.id}>
                  <Link href={`/photo-prints/order?size=${size.id}`} className="flex items-center justify-between rounded-[12px] border border-[var(--line)] px-3 py-3 no-underline">
                    <span>
                      <span className="block font-semibold">{size.label}</span>
                      <span className="text-sm text-[var(--muted)]">{size.cm}</span>
                    </span>
                    <span className="font-bold">{formatRs(size.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="py-2 font-semibold">Print</th>
                    <th className="py-2 font-semibold">Size</th>
                    <th className="py-2 font-semibold">Price</th>
                    <th className="py-2 font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr key={size.id} className="border-t border-[#CD7DA2]/20">
                      <td className="py-3 font-semibold text-slate-900">{size.label}</td>
                      <td className="py-3 text-slate-600">{size.cm}</td>
                      <td className="py-3 font-semibold text-slate-900">{formatRs(size.price)}</td>
                      <td className="py-3 text-right">
                        <Link href={`/photo-prints/order?size=${size.id}`} className="font-semibold text-[#B10C53]">
                          Order
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Twelve or more copies of the same size are 10% less. Thirty or more are 20% less. Passport sheets stay at the sheet price.
            </p>
          </div>
          <div className="space-y-4">
            <div className="surface-card rounded-[1.75rem] p-5">
              <h2 className="font-display text-2xl font-bold text-slate-900">Paper</h2>
              <ul className="mt-3 space-y-3">
                {FINISHES.map((finish) => (
                  <li key={finish.id}>
                    <p className="font-semibold text-slate-900">{finish.title}</p>
                    <p className="text-sm text-slate-600">{finish.text}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="surface-card rounded-[1.75rem] p-5">
              <h2 className="font-display text-2xl font-bold text-slate-900">Frames and wall prints</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Canvas, acrylic, and frames are quoted from the photo and the size. Send the picture on WhatsApp and we will reply with a price before anything is printed.
              </p>
              <a
                href={whatsappHref("Hello Siyatha, I need a price for a framed photo or a wall print.")}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp mt-4 no-underline"
              >
                Ask for a wall-print price
              </a>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl font-bold text-slate-900">Questions</h2>
          <div className="mt-5 grid gap-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="surface-card rounded-2xl p-4">
                <summary className="cursor-pointer font-semibold text-slate-900">{faq.question}</summary>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
