import { formatRs } from "@/lib/storefront";
import { getShopDelivery } from "@/lib/shopDelivery";
import { pageMeta } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = pageMeta(
  "/shipping",
  "Shipping and delivery",
  "Photo prints ship within one business day. See the delivery fee and when islandwide courier is free."
);

export default async function ShippingPage() {
  const delivery = await getShopDelivery();
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold">Shipping and delivery</h1>
      <div className="mt-6 space-y-4 text-base leading-7 text-[var(--muted)]">
        <p>Photo prints leave within one business day after we accept the file. Packaging and craft leave with the next courier run.</p>
        <p>
          Delivery is {formatRs(delivery.deliveryCharge)} when the goods total is under {formatRs(delivery.freeDeliveryAbove)}. It is free at or above that amount. The cart shows the fee before you pay.
        </p>
        <p>We send parcels across Sri Lanka by courier. Cash on delivery and bank transfer are the payment options.</p>
      </div>
    </article>
  );
}
