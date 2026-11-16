import { NextResponse } from "next/server";
import { printTableToRecord } from "@/lib/storefront";
import { getShopSettings } from "@/lib/shopDelivery";

export async function GET() {
  const settings = await getShopSettings();
  return NextResponse.json({
    freeDeliveryAbove: settings.freeDeliveryAbove,
    deliveryCharge: settings.deliveryCharge,
    printPrices: printTableToRecord(settings.printPrices),
  });
}
