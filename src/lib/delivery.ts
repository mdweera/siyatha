export const INITIAL_FREE_DELIVERY = 1000;
export const INITIAL_DELIVERY_CHARGE = 300;

export type ShopDelivery = {
  freeDeliveryAbove: number;
  deliveryCharge: number;
};

export type FulfillmentMethod = "delivery" | "pickup";

export type DeliveryQuote = {
  subtotal: number;
  threshold: number;
  charge: number;
  qualifies: boolean;
  remaining: number;
  total: number;
  fulfillment: FulfillmentMethod;
  pickup: boolean;
};

export function isFulfillmentMethod(value: unknown): value is FulfillmentMethod {
  return value === "delivery" || value === "pickup";
}

export function quoteDelivery(
  subtotal: number,
  settings: ShopDelivery,
  fulfillment: FulfillmentMethod = "delivery"
): DeliveryQuote {
  const goods = Math.max(0, Number(subtotal) || 0);
  const threshold = Math.max(0, Number(settings.freeDeliveryAbove) || 0);
  const standardCharge = Math.max(0, Number(settings.deliveryCharge) || 0);
  const pickup = fulfillment === "pickup";
  const qualifies = pickup || (threshold > 0 && goods >= threshold);
  const charge = pickup || goods <= 0 || qualifies ? 0 : standardCharge;

  return {
    subtotal: goods,
    threshold,
    charge,
    qualifies,
    remaining: pickup || qualifies || threshold <= 0 ? 0 : Math.max(0, Math.ceil(threshold - goods)),
    total: goods + charge,
    fulfillment,
    pickup,
  };
}
