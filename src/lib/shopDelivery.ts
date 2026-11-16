import { MongoClient } from "mongodb";
import { INITIAL_FREE_DELIVERY, type ShopDelivery } from "@/lib/delivery";

const POS_DB_NAME = "pos_app_sl";
const CACHE_MS = 30_000;

let cached: { at: number; value: ShopDelivery } | null = null;
let clientPromise: Promise<MongoClient> | null = null;

function posMongoUri(): string | null {
  const dedicated = process.env.CLOUD_POS_MONGODB_URI?.trim();
  if (dedicated) {
    return dedicated;
  }

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    return null;
  }

  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/[^/]+)(?:\/[^?]*)?(\?.*)?$/);
  if (!match) {
    return null;
  }

  return `${match[1]}/${POS_DB_NAME}${match[2] || ""}`;
}

async function readPosDelivery(): Promise<ShopDelivery> {
  const uri = posMongoUri();
  if (!uri) {
    return { freeDeliveryAbove: INITIAL_FREE_DELIVERY, deliveryCharge: 0 };
  }

  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect();
  }

  const client = await clientPromise;
  const doc = await client
    .db(POS_DB_NAME)
    .collection("Settings")
    .findOne({}, { projection: { onlineFreeDeliveryAbove: 1, onlineDefaultDeliveryCharge: 1 } });

  const freeDeliveryAbove = Number(doc?.onlineFreeDeliveryAbove);
  const deliveryCharge = Number(doc?.onlineDefaultDeliveryCharge);

  return {
    freeDeliveryAbove: Number.isFinite(freeDeliveryAbove) ? freeDeliveryAbove : INITIAL_FREE_DELIVERY,
    deliveryCharge: Number.isFinite(deliveryCharge) ? Math.max(0, deliveryCharge) : 0,
  };
}

export async function getShopDelivery(): Promise<ShopDelivery> {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.value;
  }

  try {
    const value = await readPosDelivery();
    cached = { at: Date.now(), value };
    return value;
  } catch (error) {
    console.error("Could not read Cloud POS delivery settings:", error);
    return cached?.value ?? { freeDeliveryAbove: INITIAL_FREE_DELIVERY, deliveryCharge: 0 };
  }
}
