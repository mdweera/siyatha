import { MongoClient } from "mongodb";
import { INITIAL_FREE_DELIVERY, type ShopDelivery } from "@/lib/delivery";
import {
  defaultPrintPriceTable,
  printTableFromRecord,
  type PrintPriceTable,
} from "@/lib/storefront";

const POS_DB_NAME = "pos_app_sl";
const CACHE_MS = 30_000;

export type ShopSettings = ShopDelivery & {
  printPrices: PrintPriceTable;
};

let cached: { at: number; value: ShopSettings } | null = null;
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

function readPrintPrices(value: unknown): PrintPriceTable {
  if (typeof value === "string") {
    try {
      return printTableFromRecord(JSON.parse(value));
    } catch {
      return defaultPrintPriceTable();
    }
  }

  return printTableFromRecord(value);
}

const FALLBACK_SETTINGS: ShopSettings = {
  freeDeliveryAbove: INITIAL_FREE_DELIVERY,
  deliveryCharge: 300,
  printPrices: defaultPrintPriceTable(),
};

async function readPosSettings(): Promise<ShopSettings> {
  const uri = posMongoUri();
  if (!uri) {
    return FALLBACK_SETTINGS;
  }

  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect();
  }

  const client = await clientPromise;
  const doc = await client
    .db(POS_DB_NAME)
    .collection("Settings")
    .findOne(
      {},
      {
        projection: {
          onlineFreeDeliveryAbove: 1,
          onlineDefaultDeliveryCharge: 1,
          onlinePrintPrices: 1,
        },
      }
    );

  const freeDeliveryAbove = Number(doc?.onlineFreeDeliveryAbove);
  const deliveryCharge = Number(doc?.onlineDefaultDeliveryCharge);

  return {
    freeDeliveryAbove: Number.isFinite(freeDeliveryAbove) ? freeDeliveryAbove : INITIAL_FREE_DELIVERY,
    deliveryCharge: Number.isFinite(deliveryCharge) ? Math.max(0, deliveryCharge) : FALLBACK_SETTINGS.deliveryCharge,
    printPrices: readPrintPrices(doc?.onlinePrintPrices),
  };
}

export async function getShopSettings(): Promise<ShopSettings> {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.value;
  }

  try {
    const value = await readPosSettings();
    cached = { at: Date.now(), value };
    return value;
  } catch (error) {
    console.error("Could not read Cloud POS shop settings:", error);
    return cached?.value ?? FALLBACK_SETTINGS;
  }
}

export async function getShopDelivery(): Promise<ShopDelivery> {
  const settings = await getShopSettings();
  return {
    freeDeliveryAbove: settings.freeDeliveryAbove,
    deliveryCharge: settings.deliveryCharge,
  };
}
