import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, Truck } from "lucide-react";
import StockCard from "@/components/shop/StockCard";
import { getPublishedProducts } from "@/lib/publishedProducts";
import { getShopDelivery } from "@/lib/shopDelivery";
import {
  HERO_CRAFT,
  HERO_PACKAGING,
  HERO_PHOTO,
  PRINT_SIZES,
  departments,
  formatRs,
  productMatchesDepartment,
  whatsappHref,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

const pillars = [
  {
    href: "/photo-prints",
    eyebrow: "Upload and we print",
    title: "Photo print Sri Lanka",
    text: "Phone photos, enlargements, passport sheets, and cards. Upload them and we ship the prints within one business day.",
    image: HERO_PHOTO,
    cta: "Start a print",
  },
  {
    href: "/packaging",
    eyebrow: departments.packaging.eyebrow,
    title: "Packaging for sellers",
    text: departments.packaging.summary,
    image: HERO_PACKAGING,
    cta: "See packaging",
  },
  {
    href: "/craft",
    eyebrow: departments.craft.eyebrow,
    title: "Craft materials",
    text: departments.craft.summary,
    image: HERO_CRAFT,
    cta: "See craft materials",
  },
];

const steps = [
  { title: "Choose the size", text: "4×6 copies, a frame-size enlargement, a passport sheet, or a photo card." },
  { title: "Upload the photos", text: "Drop JPG, PNG, or WEBP files. Set how many copies of each picture." },
  { title: "We print and ship", text: "Photo prints leave within one business day." },
];

export default async function HomePage() {
  const [products, delivery] = await Promise.all([getPublishedProducts(), getShopDelivery()]);
  const focused = products.filter(
    (product) => productMatchesDepartment(product, "packaging") || productMatchesDepartment(product, "craft")
  );
  const previewSizes = PRINT_SIZES.filter((size) => ["4x6", "5x7", "8x10", "a4", "passport-8"].includes(size.id));

  return (
    <div className="pb-14">
      <section className="px-4 pt-7 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-card rounded-[2rem] p-6 sm:p-8">
            <p className="vibrant-chip inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
              Photo prints ship within one business day
            </p>
            <h1 className="mt-4 font-display text-4xl font-black leading-[1.05] text-slate-900 sm:text-5xl">
              Photo prints, seller packaging, and craft materials.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">
              Upload a picture and we print it. Pack the orders you sell online. Stock paper, glue, and sewing supplies for making at home.
              සෑමවිටම හොඳම මිල ඔබට.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/photo-prints/order"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white"
              >
                Upload photos <ArrowRight size={16} />
              </Link>
              <Link
                href="/packaging"
                className="inline-flex items-center gap-2 rounded-full bg-[#FBC24E] px-6 py-3 text-sm font-bold text-slate-900"
              >
                Packaging
              </Link>
              <Link
                href="/craft"
                className="inline-flex items-center gap-2 rounded-full border border-[#CD7DA2] bg-white px-6 py-3 text-sm font-semibold text-slate-800"
              >
                Craft materials
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Clock3 size={16} className="text-[#B10C53]" /> Ships within one business day
              </span>
              <span className="inline-flex items-center gap-2">
                <Truck size={16} className="text-[#B10C53]" /> Free delivery above {formatRs(delivery.freeDeliveryAbove)}
              </span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/photo-prints" className="group relative overflow-hidden rounded-[1.75rem] sm:col-span-2">
              <div className="relative aspect-[16/9] sm:aspect-[16/8]">
                <Image src={HERO_PHOTO} alt="Printed photographs on a table" fill priority className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F9E094]">Photo print Sri Lanka</p>
                  <p className="mt-1 font-display text-2xl font-bold">From {formatRs(30)} for a 4×6</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <Link key={pillar.href} href={pillar.href} className="surface-card group overflow-hidden rounded-[1.75rem]">
              <div className="relative aspect-[16/10]">
                <Image src={pillar.image} alt="" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 33vw" />
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B10C53]">{pillar.eyebrow}</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{pillar.text}</p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                  {pillar.cta} <ArrowRight size={14} />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="vibrant-chip inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
              Photo print Sri Lanka
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900">A simple print desk</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Choose the print, drop the photos, and see the total before you add them to the cart. We check the file and write to you if a picture will crop badly.
            </p>
            <ol className="mt-5 space-y-3">
              {steps.map((step, index) => (
                <li key={step.title} className="surface-card flex gap-3 rounded-2xl p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#681878] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="surface-card rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-end justify-between gap-3">
              <h3 className="font-display text-2xl font-bold text-slate-900">Prices people ask for first</h3>
              <Link href="/photo-prints" className="text-sm font-semibold text-[#B10C53]">
                Full list
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-[#CD7DA2]/20">
              {previewSizes.map((size) => (
                <li key={size.id}>
                  <Link href={`/photo-prints/order?size=${size.id}`} className="flex items-center justify-between gap-3 py-3">
                    <span>
                      <span className="block font-semibold text-slate-900">{size.label}</span>
                      <span className="block text-sm text-slate-500">{size.cm} · {size.blurb}</span>
                    </span>
                    <span className="font-display text-lg font-bold text-slate-900">{formatRs(size.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Glossy, matte, and lustre are the same price. Twelve copies of one size save 10%.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-4 md:grid-cols-3">
          {[
            { icon: Clock3, title: "One business day", text: "Photo prints are packed and shipped within one business day." },
            { icon: BadgeCheck, title: "File check", text: "We look at the photo before printing and message you if it needs a crop." },
            { icon: Truck, title: "Islandwide courier", text: `Free delivery on orders above ${formatRs(delivery.freeDeliveryAbove)}.` },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="surface-card rounded-3xl p-5">
                <Icon className="text-[#B10C53]" size={20} />
                <h3 className="mt-3 font-display text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      {focused.length > 0 ? (
        <section className="px-4 pt-12 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="font-display text-2xl font-bold text-slate-900">Packaging and craft in stock</h2>
              <Link href="/shop" className="text-sm font-semibold text-[#B10C53]">
                Shop
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {focused.slice(0, 4).map((product) => (
                <StockCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-4 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 rounded-[2rem] bg-gradient-to-r from-[#681878] via-[#B10C53] to-[#DE2684] p-7 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Send the photos, or ask what to pack.</h2>
            <p className="mt-2 max-w-xl text-sm text-white/85">
              Upload on the print desk, or WhatsApp the list if that is easier.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/photo-prints/order" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[#681878]">
              Upload photos
            </Link>
            <a
              href={whatsappHref("Hello Siyatha, I want to ask about photo prints, packaging, or craft materials.")}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
