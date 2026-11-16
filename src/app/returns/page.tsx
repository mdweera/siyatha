import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/returns",
  "Returns and refunds",
  "How Siyatha handles a wrong item, a damaged parcel, or a photo print that does not match the file."
);

export default function ReturnsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold">Returns and refunds</h1>
      <div className="mt-6 space-y-4 text-base leading-7 text-[var(--muted)]">
        <p>Message us on WhatsApp within 3 days of delivery if an item is wrong, missing, or damaged in transit. Send a photo of the parcel.</p>
        <p>If a photo print is the wrong size, the wrong paper, or badly printed compared with the file you sent, we reprint it or refund that print.</p>
        <p>A print that matches a small or tightly cropped file is not a fault. We message you before printing when the file looks too soft or a face sits on the edge.</p>
      </div>
    </article>
  );
}
