import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/privacy",
  "Privacy",
  "How Siyatha stores uploaded photos, order details, and WhatsApp messages."
);

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold">Privacy</h1>
      <div className="mt-6 space-y-4 text-base leading-7 text-[var(--muted)]">
        <p>Photos you upload are kept so we can print the order. Staff handling that order can see them. They are not shown on the public site.</p>
        <p>Ask on WhatsApp and we delete the photos from the order. Order name, phone, and address stay as long as we need them for delivery and accounts.</p>
        <p>WhatsApp messages stay in that chat. We do not sell customer lists.</p>
      </div>
    </article>
  );
}
