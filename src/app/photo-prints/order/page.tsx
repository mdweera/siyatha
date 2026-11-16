import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PrintStudio from "@/components/photo-prints/PrintStudio";

const flow = [
  { title: "Pick what to print", text: "Photo copies, enlargements, passport sheets, or photo cards." },
  { title: "Pick a size", text: "The per-print price and the bulk discount show before you add photos." },
  { title: "Send the photos", text: "JPG, PNG, WEBP, or iPhone HEIC up to 12 MB. Set copies and choose the crop." },
  { title: "Review and add to cart", text: "Delivery is added at checkout. Prints ship within one business day." },
];

export const metadata: Metadata = {
  title: "Print your photos",
  description:
    "Choose a photo print size, send JPG or PNG photos, and add them to your Siyatha cart. Prints ship within one business day.",
  alternates: { canonical: "/photo-prints/order" },
};

export default async function PhotoPrintOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ family?: string; size?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-sm text-slate-500">
          <Link href="/photo-prints" className="font-semibold text-[#B10C53]">
            Photo prints
          </Link>{" "}
          / Order
        </p>
        <h1 className="mt-3 font-display text-4xl font-black text-slate-900">Print your photos</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          ඡායාරූප එවන්න. අපි එදාම print කරලා එක ව්‍යාපාරික දිනයක් ඇතුළත යවනවා. Pick a size, send the photos, and the total updates as you change the size and the number of copies.
        </p>

        <section aria-label="How a photo print order goes" className="surface-card mt-6 rounded-[1.5rem] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B10C53]">How the order goes</h2>
            <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-semibold">Enter</kbd>
              continues
              <span aria-hidden="true">·</span>
              <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-semibold">Esc</kbd>
              goes back a step
            </p>
          </div>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {flow.map((step, index) => (
              <li key={step.title} className="relative rounded-2xl border border-slate-200 bg-white px-3 py-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#681878] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <p className="mt-2 text-sm font-bold text-slate-900">{step.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{step.text}</p>
                {index < flow.length - 1 ? (
                  <ArrowRight
                    aria-hidden="true"
                    size={16}
                    className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 text-[#CD7DA2] lg:block"
                  />
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-6">
          <PrintStudio initialFamily={params.family} initialSize={params.size} />
        </div>
      </div>
    </div>
  );
}
