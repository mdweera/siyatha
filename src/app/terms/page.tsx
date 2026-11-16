import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/terms",
  "Terms",
  "The terms for ordering photo prints, packaging, and craft materials from Siyatha Online."
);

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold">Terms</h1>
      <div className="mt-6 space-y-4 text-base leading-7 text-[var(--muted)]">
        <p>Prices on the site are in Sri Lankan rupees. A photo print price is calculated from the size and the number of copies, not from a price typed in the browser.</p>
        <p>Passport and visa sheets follow the size you choose. Official rules change, so check the current requirement before you order.</p>
        <p>We can refuse a file we cannot print. Payment is cash on delivery or bank transfer unless the checkout offers another method.</p>
      </div>
    </article>
  );
}