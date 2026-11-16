import { NextResponse } from "next/server";
import { getShopDelivery } from "@/lib/shopDelivery";

export async function GET() {
  const delivery = await getShopDelivery();
  return NextResponse.json(delivery);
}
