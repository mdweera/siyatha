"use client";

import { useEffect } from "react";
import { printTableFromRecord, setClientPrintPrices } from "@/lib/storefront";
import { useCartStore } from "@/store/useCartStore";

export default function PrintPriceSync() {
  const reprice = useCartStore((state) => state.reprice);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/shop-settings")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled || !data?.printPrices) {
          return;
        }
        setClientPrintPrices(printTableFromRecord(data.printPrices));
        reprice();
      })
      .catch(() => {
        // The printed prices stay on the built-in list until settings load.
      });

    return () => {
      cancelled = true;
    };
  }, [reprice]);

  return null;
}
