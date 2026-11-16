import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  FINISHES,
  PRINT_FAMILIES,
  PRINT_FAQS,
  PRINT_SIZES,
  SHOP_PHONE_DISPLAY,
  SITE_URL,
  formatRs,
  lowestFamilyPrice,
  sizesForFamily,
  whatsappHref,
} from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Photo Print Sri Lanka",
  description:
    "Photo print in Sri Lanka from Rs 30. Upload photos for 4×6 prints, enlargements, passport sheets, and photo cards. Prints ship within one business day.",
  keywords: [
    "photo print sri lanka",
    "photo printing sri lanka",
    "4x6 photo print",
    "passport photo sri lanka",
    "photo print colombo",
    "photo print galle",
    "photo print ambalangoda",
  ],
  alternates: { canonical: "/photo-prints" },
  openGraph: {
    title: "Photo Print Sri Lanka | Siyatha",
    description:
      "Upload photos and we ship the prints within one business day. Copies, enlargements, passport sheets, and cards, with islandwide delivery.",
    url: `${SITE_URL}/photo-prints`,
    type: "website",
  },
};

export default function PhotoPrintsPage() {
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
        mainEntity: PRINT_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto w-full max-w-7xl space-y-12">
        <section className="surface-card rounded-[2rem] p-6 sm:p-8">
          <p className="text-sm text-slate-500">Home / Photo prints</p>
          <p className="vibrant-chip mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
            Photo print Sri Lanka
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
            Upload the photos. We ship the prints within one business day.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
            Standard copies, enlargements, passport sheets, and photo cards on lustre, glossy, or matte paper.
            A photo order placed on a working day is shipped the same business day, then the courier takes it across Sri Lanka.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/photo-prints/order" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white">
              Upload photos <ArrowRight size={16} />
            </Link>
            <a
              href={whatsappHref("Hello Siyatha, I want a photo print quote.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-800"
            >
              WhatsApp a quote
            </a>
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl font-bold text-slate-900">Choose a print</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {PRINT_FAMILIES.map((family) => {
              const from = lowestFamilyPrice(family.id);
              const first = sizesForFamily(family.id)[0];
              return (
                <Link
                  key={family.id}
                  href={`/photo-prints/order?family=${family.id}${first ? `&size=${first.id}` : ""}`}
                  className="surface-card rounded-[1.75rem] p-5 transition hover:-translate-y-0.5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B10C53]">From {formatRs(from)}</p>
                  <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">{family.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{family.text}</p>
                  <p className="mt-4 text-sm font-semibold text-slate-900">Open this size <ArrowRight className="inline" size={14} /></p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-card rounded-[1.75rem] p-5 sm:p-6">
            <h2 className="font-display text-2xl font-bold text-slate-900">Photo print prices</h2>
            <p className="mt-2 text-sm text-slate-600">Per print, in Sri Lankan rupees. Paper finish does not change the price.</p>
            <div className="mt-4 overflow-x-auto">
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
                  {PRINT_SIZES.map((size) => (
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
                className="mt-4 inline-flex text-sm font-semibold text-[#B10C53]"
              >
                Ask for a wall-print price
              </a>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl font-bold text-slate-900">Questions</h2>
          <div className="mt-5 grid gap-3">
            {PRINT_FAQS.map((faq) => (
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
