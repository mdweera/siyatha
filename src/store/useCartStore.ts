import { create } from "zustand";
import { persist } from "zustand/middleware";
import { printUnitPrice } from "@/lib/storefront";

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  kind?: "product" | "print";
  detail?: string;
  sizeId?: string;
  finishId?: string;
}

interface CartStore {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  priceVersion: number;
  reprice: () => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

function withPrintPrices(items: CartItem[]): CartItem[] {
  const copiesBySize = new Map<string, number>();

  items.forEach((item) => {
    if (item.kind !== "print" || !item.sizeId) {
      return;
    }

    const key = `${item.sizeId}|${item.finishId || "lustre"}`;
    copiesBySize.set(key, (copiesBySize.get(key) || 0) + item.quantity);
  });

  return items.map((item) => {
    if (item.kind !== "print" || !item.sizeId) {
      return item;
    }

    const key = `${item.sizeId}|${item.finishId || "lustre"}`;
    const price = printUnitPrice(item.sizeId, copiesBySize.get(key) || item.quantity);
    return price == null ? item : { ...item, price };
  });
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      priceVersion: 0,
      addToCart: (item) => {
        const quantity = item.quantity && item.quantity > 0 ? Math.floor(item.quantity) : 1;
        const currentItems = get().items;

        if (item.kind === "print") {
          set({ items: withPrintPrices([...currentItems, { ...item, quantity }]) });
          return;
        }

        const existingItem = currentItems.find((entry) => entry._id === item._id && entry.kind !== "print");
        if (existingItem) {
          set({
            items: currentItems.map((entry) =>
              entry._id === item._id && entry.kind !== "print"
                ? { ...entry, quantity: entry.quantity + quantity }
                : entry
            ),
          });
          return;
        }

        set({ items: [...currentItems, { ...item, kind: "product", quantity }] });
      },
      removeFromCart: (id) => {
        set({ items: withPrintPrices(get().items.filter((item) => item._id !== id)) });
      },
      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeFromCart(id);
          return;
        }

        set({
          items: withPrintPrices(
            get().items.map((item) => (item._id === id ? { ...item, quantity } : item))
          ),
        });
      },
      reprice: () =>
        set({
          items: withPrintPrices(get().items),
          priceVersion: get().priceVersion + 1,
        }),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: "siyatha-online-cart",
    }
  )
);
