import { SHOP_PHONE_DISPLAY, whatsappHref } from "@/lib/storefront";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/privacy",
  "Privacy",
  "How Siyatha Online looks after your photos, order details, and messages. We care about your privacy."
);

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold text-[var(--ink)]">Privacy</h1>
      <p className="mt-3 text-base leading-7 text-[var(--muted)]">
        We care about your privacy. This page explains what we collect when you use siyatha.lk, why we keep it, and how you can ask us to remove it.
      </p>

      <div className="mt-8 space-y-8 text-base leading-7 text-[var(--muted)]">
        <section>
          <h2 className="text-xl font-bold text-[var(--ink)]">Photos you send for printing</h2>
          <p className="mt-2">
            Photos uploaded for a print order are stored only so we can print and fulfil that order. Only staff working on the order can see them. They are never shown on the public website, never used for marketing, and never shared with anyone outside the shop.
          </p>
          <p className="mt-2">
            When the order is finished, ask us on WhatsApp and we will delete the photos from the order. If you prefer, say so when you place the order and we will remove them as soon as printing is done.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--ink)]">Order and account details</h2>
          <p className="mt-2">
            Name, phone number, delivery address, and payment notes are kept so we can deliver your order, contact you about it, and keep basic shop records. We keep that information only as long as we need it for delivery, returns, and accounts.
          </p>
          <p className="mt-2">
            If you create an account, we use your email and sign-in details to show your orders and keep the account secure. You can ask us to close the account and remove personal details that are no longer needed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--ink)]">WhatsApp and messages</h2>
          <p className="mt-2">
            Messages you send on WhatsApp stay in that chat between you and the shop. We use them to answer questions, confirm sizes, and help with your order. We do not copy those chats into public pages or sell them.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--ink)]">What we do not do</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>We do not sell customer lists or order data.</li>
            <li>We do not publish your photos on the site.</li>
            <li>We do not use your photos for ads or social posts without your clear permission.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--ink)]">Cookies and site tools</h2>
          <p className="mt-2">
            The site may use cookies or similar tools so the cart, language choice, and login keep working across pages. We do not use them to build advertising profiles about you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--ink)]">Ask us anytime</h2>
          <p className="mt-2">
            If you want to see what we hold, correct a detail, delete photos, or ask a privacy question, message us on WhatsApp at{" "}
            <a className="font-semibold text-[var(--ink)] underline" href={whatsappHref("Hello Siyatha, I have a privacy question.")}>
              {SHOP_PHONE_DISPLAY}
            </a>
            . We will reply as quickly as we can.
          </p>
          <p className="mt-2 text-sm">
            Siyatha Online · Kirimatiya, Batapola, Ambalangoda · Sri Lanka
          </p>
        </section>
      </div>
    </article>
  );
}
