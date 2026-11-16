import Link from "next/link";
import {
  Barcode,
  Box,
  Droplet,
  FileText,
  Heart,
  MessageCircle,
  Package,
  Palette,
  Ribbon,
  Scissors,
  ScrollText,
  Shirt,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";
import StockCard from "@/components/shop/StockCard";
import type { ShopProduct } from "@/lib/publishedProducts";
import { departments, productSearchText, whatsappHref, type DepartmentId } from "@/lib/storefront";
import { getLang } from "@/lib/site";

type DepartmentPageProps = {
  dept: DepartmentId;
  products: ShopProduct[];
};

const CATEGORY_ICONS: Record<string, { icon: LucideIcon; tone: string }> = {
  mailers: { icon: Package, tone: "bg-[#F2B400] text-[#111]" },
  boxes: { icon: Box, tone: "bg-[#DE2684] text-white" },
  bubble: { icon: Package, tone: "bg-[#681878] text-white" },
  tape: { icon: Tag, tone: "bg-[#B10C53] text-white" },
  thanks: { icon: Heart, tone: "bg-[#DE2684] text-white" },
  labels: { icon: Tag, tone: "bg-[#F2B400] text-[#111]" },
  tissue: { icon: ScrollText, tone: "bg-[#CD7DA2] text-[#2b1636]" },
  thermal: { icon: Barcode, tone: "bg-[#111] text-[#F2B400]" },
  paper: { icon: FileText, tone: "bg-[#F2B400] text-[#111]" },
  glue: { icon: Droplet, tone: "bg-[#681878] text-white" },
  cut: { icon: Scissors, tone: "bg-[#DE2684] text-white" },
  sew: { icon: Shirt, tone: "bg-[#B10C53] text-white" },
  ribbon: { icon: Ribbon, tone: "bg-[#CD7DA2] text-[#2b1636]" },
  paint: { icon: Palette, tone: "bg-[#681878] text-white" },
  felt: { icon: Sparkles, tone: "bg-[#F2B400] text-[#111]" },
  bits: { icon: Sparkles, tone: "bg-[#DE2684] text-white" },
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
          <span className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${dept === "packaging" ? "bg-[#F2B400] text-[#111]" : "bg-[#681878] text-white"}`}>
            {dept === "packaging" ? <Package size={28} /> : <Palette size={28} />}
          </span>
          <p className="mt-4 text-sm font-semibold text-[var(--muted)]">{department.eyebrow}</p>
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
              const mark = CATEGORY_ICONS[category.id] ?? { icon: Package, tone: "bg-[#F2B400] text-[#111]" };
              const Icon = mark.icon;
              return (
                <a key={category.id} href={href} className="surface-card p-4 no-underline" {...(count === 0 ? { target: "_blank", rel: "noreferrer" } : {})}>
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${mark.tone}`}>
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-3 font-bold">{category.title}</h3>
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
