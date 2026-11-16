import type { Metadata } from "next";
import Link from "next/link";
import PrintStudio from "@/components/photo-prints/PrintStudio";

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
        <div className="mt-6">
          <PrintStudio initialFamily={params.family} initialSize={params.size} />
        </div>
      </div>
    </div>
  );
}
