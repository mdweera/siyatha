export const INITIAL_FREE_DELIVERY = 1000;
export const INITIAL_DELIVERY_CHARGE = 300;

export type ShopDelivery = {
  freeDeliveryAbove: number;
  deliveryCharge: number;
};

export type DeliveryQuote = {
  subtotal: number;
  threshold: number;
  charge: number;
  qualifies: boolean;
  remaining: number;
  total: number;
};

export function quoteDelivery(subtotal: number, settings: ShopDelivery): DeliveryQuote {
  const goods = Math.max(0, Number(subtotal) || 0);
  const threshold = Math.max(0, Number(settings.freeDeliveryAbove) || 0);
  const standardCharge = Math.max(0, Number(settings.deliveryCharge) || 0);
  const qualifies = threshold > 0 && goods >= threshold;
  const charge = goods <= 0 || qualifies ? 0 : standardCharge;

  return {
    subtotal: goods,
    threshold,
    charge,
    qualifies,
    remaining: qualifies || threshold <= 0 ? 0 : Math.max(0, Math.ceil(threshold - goods)),
    total: goods + charge,
  };
}
