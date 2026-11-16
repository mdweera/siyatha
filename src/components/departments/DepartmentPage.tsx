import Link from "next/link";
import { MessageCircle } from "lucide-react";
import StockCard from "@/components/shop/StockCard";
import type { ShopProduct } from "@/lib/publishedProducts";
import { departments, productSearchText, whatsappHref, type DepartmentId } from "@/lib/storefront";
import { getLang } from "@/lib/site";

type DepartmentPageProps = {
  dept: DepartmentId;
  products: ShopProduct[];
};

const guides: Record<DepartmentId, Array<{ title: string; text: string }>> = {
  packaging: [
    { title: "Clothing seller starter", text: "Poly mailers, thank-you cards, and packing tape for the first week of orders." },
    { title: "Fragile goods", text: "A box, bubble wrap, and a fragile sticker for mugs, bottles, and glass." },
    { title: "What fits", text: "A small mailer fits a shirt. A carton fits a few boxes of soap or a pair of shoes. Ask if you are unsure." },
  ],
  craft: [
    { title: "School project kit", text: "Colour paper, glue, and scissors for a classroom pack." },
    { title: "Greeting card kit", text: "Card, ribbon, and a small embellishment set." },
    { title: "Sewing basics", text: "Thread, needles, and buttons for a home repair." },
  ],
};

export default async function DepartmentPage({ dept, products }: DepartmentPageProps) {
  const lang = await getLang();
  const department = departments[dept];
  const title = lang === "si" ? department.titleSi : department.title;
  const whatsapp = whatsappHref(`Hello Siyatha, I need ${department.title.toLowerCase()}.`);

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <section className="surface-card p-6 sm:p-8">
          <p className="text-sm font-semibold text-[var(--muted)]">{department.eyebrow}</p>
          <h1 className="mt-2 text-4xl font-bold text-[var(--ink)]">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">{department.summary}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={department.shopHref} className="btn-primary no-underline">
              Shop {department.title.toLowerCase()}
            </Link>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="btn-whatsapp no-underline">
              <MessageCircle size={16} /> Ask on WhatsApp
            </a>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {guides[dept].map((guide) => (
            <a key={guide.title} href={whatsapp} target="_blank" rel="noreferrer" className="surface-card p-4 no-underline">
              <h2 className="font-bold">{guide.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{guide.text}</p>
            </a>
          ))}
        </section>

        <section>
          <h2 className="text-2xl font-bold">Categories</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {department.categories.map((category) => {
              const count = products.filter((product) => productSearchText(product).includes(category.query.toLowerCase())).length;
              const href = count > 0 ? `/shop?dept=${department.id}&q=${encodeURIComponent(category.query)}` : whatsapp;
              return (
                <a key={category.id} href={href} className="surface-card p-4 no-underline" {...(count === 0 ? { target: "_blank", rel: "noreferrer" } : {})}>
                  <h3 className="font-bold">{category.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{category.text}</p>
                  <p className="mt-3 text-sm font-semibold">{count > 0 ? `${count} in stock` : "Ask on WhatsApp"}</p>
                </a>
              );
            })}
          </div>
        </section>

        {products.length > 0 ? (
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="text-2xl font-bold">In stock</h2>
              <Link href={department.shopHref} className="text-sm font-semibold underline">
                Open shop
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {products.slice(0, 8).map((product) => (
                <StockCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
