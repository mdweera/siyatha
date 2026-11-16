import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import StockCard from "@/components/shop/StockCard";
import type { ShopProduct } from "@/lib/publishedProducts";
import { departments, whatsappHref, type DepartmentId } from "@/lib/storefront";

type DepartmentPageProps = {
  dept: DepartmentId;
  products: ShopProduct[];
};

export default function DepartmentPage({ dept, products }: DepartmentPageProps) {
  const department = departments[dept];
  const whatsapp = whatsappHref(
    `Hello Siyatha, I need help with ${department.title.toLowerCase()}.`
  );

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-10">
        <section className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-card rounded-[2rem] p-6 sm:p-8">
            <p className="vibrant-chip inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
              {department.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
              {department.title}
              <span className="mt-2 block text-2xl text-[#B10C53] sm:text-3xl">{department.titleSi}</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">{department.summary}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={department.shopHref}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white"
              >
                Shop {department.title.toLowerCase()} <ArrowRight size={16} />
              </Link>
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800"
              >
                <MessageCircle size={16} /> Ask for a pack
              </a>
            </div>
          </div>
          <div className="relative min-h-72 overflow-hidden rounded-[2rem]">
            <Image
              src={department.image}
              alt={department.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">What people usually need</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Open a group to search the shop. If a size is missing, send the name on WhatsApp and we will check the shelf.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {department.categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?dept=${department.id}&q=${encodeURIComponent(category.query)}`}
                className="surface-card rounded-3xl p-4 transition hover:-translate-y-0.5"
              >
                <h3 className="font-display text-lg font-bold text-slate-900">{category.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{category.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-slate-900">In stock now</h2>
            <Link href={department.shopHref} className="text-sm font-semibold text-[#B10C53]">
              Open shop
            </Link>
          </div>
          {products.length === 0 ? (
            <div className="surface-card rounded-3xl p-8 text-sm leading-6 text-slate-600">
              Published {department.title.toLowerCase()} items show up here. Message us if you need something before it is listed.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {products.slice(0, 8).map((product) => (
                <StockCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
