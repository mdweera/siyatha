export const SITE_URL = "https://siyatha.lk";
export const SHOP_PHONE_DISPLAY = "+94 76 660 9143";
export const SHOP_PHONE_TEL = "+94766609143";
export const SHOP_WHATSAPP = "94766609143";
export const SHOP_PLACE = "Kirimatiya, Batapola, Ambalangoda";

export type DepartmentId = "packaging" | "craft";
export type PrintFamilyId = "copies" | "enlargements" | "passport" | "cards";
export type FinishId = "lustre" | "glossy" | "matte";

export type PrintSize = {
  id: string;
  family: PrintFamilyId;
  label: string;
  cm: string;
  price: number;
  blurb: string;
  pixels: string;
};

export type CategoryTile = {
  id: string;
  title: string;
  text: string;
  query: string;
};

export type DepartmentDefinition = {
  id: DepartmentId;
  href: string;
  shopHref: string;
  eyebrow: string;
  title: string;
  titleSi: string;
  summary: string;
  image: string;
  keywords: string[];
  categories: CategoryTile[];
};

const photoImage =
  "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?auto=format&fit=crop&w=1600&q=80";
const packagingImage =
  "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1600&q=80";
const craftImage =
  "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1600&q=80";

export const departments: Record<DepartmentId, DepartmentDefinition> = {
  packaging: {
    id: "packaging",
    href: "/packaging",
    shopHref: "/shop?dept=packaging",
    eyebrow: "For online sellers",
    title: "Packaging",
    titleSi: "බඩු ඇසුරුම්",
    summary:
      "Mailers, boxes, tape, tissue, and thank-you cards so a parcel looks finished before it leaves the house.",
    image: packagingImage,
    keywords: [
      "packag",
      "mailer",
      "courier bag",
      "poly mailer",
      "polybag",
      "bubble",
      "carton",
      "corrugat",
      "packing tape",
      "parcel tape",
      "tissue paper",
      "thank you card",
      "thank-you",
      "shipping label",
      "thermal label",
      "void fill",
      "satchel",
      "zipper bag",
      "fragile",
      "packing",
      "parcel",
    ],
    categories: [
      { id: "mailers", title: "Poly mailers", text: "Light courier bags for clothes and small orders.", query: "mailer" },
      { id: "boxes", title: "Courier boxes", text: "Cartons that survive a bus ride and a courier hub.", query: "carton" },
      { id: "bubble", title: "Bubble & void fill", text: "Wrap for mugs, bottles, and anything that can crack.", query: "bubble" },
      { id: "tape", title: "Packing tape", text: "Clear, brown, and fragile tape for closing parcels.", query: "packing tape" },
      { id: "thanks", title: "Thank-you cards", text: "A small card that makes a repeat customer.", query: "thank you" },
      { id: "labels", title: "Labels & stickers", text: "Product labels and sealing stickers.", query: "label" },
      { id: "tissue", title: "Tissue & wraps", text: "Soft wrap for jewellery, soap, and gifts.", query: "tissue" },
      { id: "thermal", title: "Thermal labels", text: "Barcode and address labels for busy dispatch days.", query: "thermal label" },
    ],
  },
  craft: {
    id: "craft",
    href: "/craft",
    shopHref: "/shop?dept=craft",
    eyebrow: "For home making",
    title: "Craft materials",
    titleSi: "අත්කම් ද්‍රව්‍ය",
    summary:
      "Paper, glue, sewing, ribbon, and the small tools people use for school projects and handmade goods.",
    image: craftImage,
    keywords: [
      "craft",
      "cardstock",
      "glue",
      "fevicol",
      "scissors",
      "washi",
      "ribbon",
      "sewing",
      "thread",
      "needle",
      "fabric",
      "felt",
      "yarn",
      "crochet",
      "embroidery",
      "paint",
      "brush",
      "foam sheet",
      "glitter",
      "origami",
      "button",
      "sequin",
      "clay",
      "diy",
      "crepe",
      "colour paper",
      "color paper",
      "googly",
      "paper craft",
    ],
    categories: [
      { id: "paper", title: "Paper & card", text: "Colour paper, cardstock, and crepe for cards and school work.", query: "paper" },
      { id: "glue", title: "Glue & tape", text: "White glue, stick glue, and craft tape that actually holds.", query: "glue" },
      { id: "cut", title: "Cutting tools", text: "Scissors and trimmers for clean paper edges.", query: "scissors" },
      { id: "sew", title: "Sewing", text: "Thread, needles, buttons, and small sewing kits.", query: "sewing" },
      { id: "ribbon", title: "Ribbon & lace", text: "Finish a gift, a dress hem, or a greeting card.", query: "ribbon" },
      { id: "paint", title: "Paint & brushes", text: "Colour for paper, fabric, and kids’ projects.", query: "paint" },
      { id: "felt", title: "Felt, foam & yarn", text: "Soft materials for toys, flowers, and classroom packs.", query: "felt" },
      { id: "bits", title: "Embellishments", text: "Glitter, sequins, googly eyes, and stickers.", query: "glitter" },
    ],
  },
};

export const PRINT_FAMILIES: Array<{
  id: PrintFamilyId;
  title: string;
  text: string;
}> = [
  {
    id: "copies",
    title: "Photo copies",
    text: "Everyday prints from a phone or camera. The 4×6 is the one most people order.",
  },
  {
    id: "enlargements",
    title: "Enlargements",
    text: "Bigger prints for a frame, a gift, or a shop wall.",
  },
  {
    id: "passport",
    title: "Passport sheets",
    text: "A sheet of matching photos you can cut. Check the current visa size before you order.",
  },
  {
    id: "cards",
    title: "Photo cards",
    text: "Birthday, thank-you, and invitation cards printed from your picture.",
  },
];

export const PRINT_SIZES: PrintSize[] = [
  { id: "4x6", family: "copies", label: "4×6 in", cm: "10×15 cm", price: 30, blurb: "Album size. The usual photo print.", pixels: "1200×1800 px" },
  { id: "5x7", family: "copies", label: "5×7 in", cm: "13×18 cm", price: 55, blurb: "A little larger for a desk frame.", pixels: "1500×2100 px" },
  { id: "6x8", family: "copies", label: "6×8 in", cm: "15×20 cm", price: 80, blurb: "Group photos and travel shots.", pixels: "1800×2400 px" },
  { id: "8x10", family: "enlargements", label: "8×10 in", cm: "20×25 cm", price: 140, blurb: "Frame size for a wall or a gift.", pixels: "2400×3000 px" },
  { id: "8x12", family: "enlargements", label: "8×12 in", cm: "20×30 cm", price: 180, blurb: "Wide scenes and family groups.", pixels: "2400×3600 px" },
  { id: "a4", family: "enlargements", label: "A4", cm: "21×29.7 cm", price: 220, blurb: "Poster-style print on photo paper.", pixels: "2480×3508 px" },
  { id: "a3", family: "enlargements", label: "A3", cm: "29.7×42 cm", price: 420, blurb: "The large print. Best from a clear photo.", pixels: "3508×4961 px" },
  { id: "passport-8", family: "passport", label: "Passport sheet", cm: "8 photos", price: 250, blurb: "Eight matching photos on one sheet.", pixels: "600×800 px for the face" },
  { id: "visa-6", family: "passport", label: "Visa sheet", cm: "6 photos", price: 320, blurb: "Six photos. Confirm the official size first.", pixels: "600×800 px for the face" },
  { id: "card-birthday", family: "cards", label: "Birthday card", cm: "5×7 in", price: 95, blurb: "Your photo on a birthday card.", pixels: "1500×2100 px" },
  { id: "card-thanks", family: "cards", label: "Thank-you card", cm: "5×7 in", price: 95, blurb: "A card for orders, weddings, and gifts.", pixels: "1500×2100 px" },
  { id: "card-invite", family: "cards", label: "Invitation", cm: "A5", price: 85, blurb: "Party and home invitations.", pixels: "1748×2480 px" },
];

export const FINISHES: Array<{ id: FinishId; title: string; text: string }> = [
  { id: "lustre", title: "Lustre", text: "Soft sheen. Fingerprints show less. This is the paper we recommend." },
  { id: "glossy", title: "Glossy", text: "Bright colour and a shine. Same price as lustre." },
  { id: "matte", title: "Matte", text: "No glare, good under glass. Same price as lustre." },
];

export const PRINT_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "How much do photo prints cost in Sri Lanka?",
    answer:
      "A 4×6 photo print at Siyatha starts at Rs 30. The price on the order page updates when you choose the size and the number of copies. Twelve or more of the same size are 10% less, and thirty or more are 20% less. Passport sheets and photo cards are priced on their own.",
  },
  {
    question: "Where can I get a photo print in Sri Lanka?",
    answer:
      "Upload the photos on siyatha.lk. We print them and send them by courier across Sri Lanka.",
  },
  {
    question: "How long does photo printing take?",
    answer:
      "Photo prints ship within one business day. If a file is too soft or an important part of the picture sits on the edge, we message you on WhatsApp before we print.",
  },
  {
    question: "What photo files can I upload?",
    answer:
      "JPG, PNG, WEBP, and iPhone HEIC from a phone or camera. Each file can be up to 12 MB. A sharp 4×6 is about 1200×1800 pixels. Smaller phone photos still print; we message you if the picture will look soft. We print borderless, so leave a little space around faces.",
  },
  {
    question: "Do you print passport photos?",
    answer:
      "Yes. We print a sheet of matching photos you can cut. Official passport and visa rules change, so check the current size before you place the order.",
  },
  {
    question: "Do you deliver photo prints outside Colombo?",
    answer:
      "Yes. Courier covers the island. The cart shows how much more you need for free delivery.",
  },
];

type MatchableProduct = {
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  sku?: string;
};

export function productSearchText(product: MatchableProduct): string {
  return `${product.name} ${product.description || ""} ${product.category || ""} ${product.brand || ""} ${product.sku || ""}`.toLowerCase();
}

export function productMatchesDepartment(product: MatchableProduct, dept: DepartmentId | "all"): boolean {
  if (dept === "all") {
    return true;
  }

  const source = productSearchText(product);
  return departments[dept].keywords.some((keyword) => source.includes(keyword));
}

export function inferDepartment(product: MatchableProduct): DepartmentId | "all" {
  const packaging = productMatchesDepartment(product, "packaging");
  const craft = productMatchesDepartment(product, "craft");
  const category = (product.category || "").toLowerCase();

  if (packaging && !craft) {
    return "packaging";
  }

  if (craft && !packaging) {
    return "craft";
  }

  if (category.includes("craft") || category.includes("sew")) {
    return "craft";
  }

  if (category.includes("pack")) {
    return "packaging";
  }

  if (packaging) {
    return "packaging";
  }

  if (craft) {
    return "craft";
  }

  return "all";
}

export type PrintPriceTable = {
  prices: Record<string, number>;
  bulk12Copies: number;
  bulk12Percent: number;
  bulk30Copies: number;
  bulk30Percent: number;
};

export function defaultPrintPriceTable(): PrintPriceTable {
  return {
    prices: Object.fromEntries(PRINT_SIZES.map((size) => [size.id, size.price])),
    bulk12Copies: 12,
    bulk12Percent: 10,
    bulk30Copies: 30,
    bulk30Percent: 20,
  };
}

export function printTableFromRecord(raw: unknown): PrintPriceTable {
  const table = defaultPrintPriceTable();
  if (!raw || typeof raw !== "object") {
    return table;
  }

  const record = raw as Record<string, unknown>;
  PRINT_SIZES.forEach((size) => {
    const value = Number(record[size.id]);
    if (Number.isFinite(value) && value >= 0) {
      table.prices[size.id] = value;
    }
  });

  const bulk12Copies = Number(record.bulk12Copies);
  const bulk12Percent = Number(record.bulk12Percent);
  const bulk30Copies = Number(record.bulk30Copies);
  const bulk30Percent = Number(record.bulk30Percent);
  if (Number.isFinite(bulk12Copies) && bulk12Copies > 0) {
    table.bulk12Copies = Math.floor(bulk12Copies);
  }
  if (Number.isFinite(bulk12Percent) && bulk12Percent >= 0 && bulk12Percent < 100) {
    table.bulk12Percent = bulk12Percent;
  }
  if (Number.isFinite(bulk30Copies) && bulk30Copies > 0) {
    table.bulk30Copies = Math.floor(bulk30Copies);
  }
  if (Number.isFinite(bulk30Percent) && bulk30Percent >= 0 && bulk30Percent < 100) {
    table.bulk30Percent = bulk30Percent;
  }

  return table;
}

export function printFaqs(table: PrintPriceTable = defaultPrintPriceTable()) {
  const start = table.prices["4x6"] ?? 30;
  const [first, ...rest] = PRINT_FAQS;
  return [
    {
      ...first,
      answer: `A 4×6 photo print at Siyatha starts at Rs ${start}. The price on the order page updates when you choose the size and the number of copies. ${table.bulk12Copies} or more of the same size are ${table.bulk12Percent}% less, and ${table.bulk30Copies} or more are ${table.bulk30Percent}% less. Passport sheets stay at the sheet price.`,
    },
    ...rest,
  ];
}

export function printTableToRecord(table: PrintPriceTable): Record<string, number> {
  return {
    ...table.prices,
    bulk12Copies: table.bulk12Copies,
    bulk12Percent: table.bulk12Percent,
    bulk30Copies: table.bulk30Copies,
    bulk30Percent: table.bulk30Percent,
  };
}

let clientPrintPrices: PrintPriceTable | null = null;

export function setClientPrintPrices(table: PrintPriceTable) {
  clientPrintPrices = table;
}

export function currentPrintPrices(): PrintPriceTable {
  return clientPrintPrices ?? defaultPrintPriceTable();
}

export function pricedPrintSizes(table: PrintPriceTable = currentPrintPrices()): PrintSize[] {
  return PRINT_SIZES.map((size) => ({
    ...size,
    price: table.prices[size.id] ?? size.price,
  }));
}

export function sizesForFamily(family: PrintFamilyId, sizes: PrintSize[] = PRINT_SIZES): PrintSize[] {
  return sizes.filter((size) => size.family === family);
}

export function findPrintSize(sizeId: string): PrintSize | undefined {
  return PRINT_SIZES.find((size) => size.id === sizeId);
}

export function findFinish(finishId: string): (typeof FINISHES)[number] | undefined {
  return FINISHES.find((finish) => finish.id === finishId);
}

export function familyFromSize(sizeId: string): PrintFamilyId {
  return findPrintSize(sizeId)?.family ?? "copies";
}

export function lowestFamilyPrice(family: PrintFamilyId, sizes: PrintSize[] = PRINT_SIZES): number {
  const prices = sizesForFamily(family, sizes).map((size) => size.price);
  return prices.length > 0 ? Math.min(...prices) : 0;
}

export function bulkMultiplier(
  family: PrintFamilyId,
  copies: number,
  table: PrintPriceTable = currentPrintPrices()
): number {
  if (family === "passport") {
    return 1;
  }

  const tiers = [
    { copies: table.bulk30Copies, percent: table.bulk30Percent },
    { copies: table.bulk12Copies, percent: table.bulk12Percent },
  ].sort((left, right) => right.copies - left.copies);

  for (const tier of tiers) {
    if (copies >= tier.copies) {
      return 1 - tier.percent / 100;
    }
  }

  return 1;
}

export function printUnitPrice(
  sizeId: string,
  copies: number,
  table: PrintPriceTable = currentPrintPrices()
): number | null {
  const size = findPrintSize(sizeId);
  if (!size) {
    return null;
  }

  const listPrice = table.prices[size.id] ?? size.price;
  const safeCopies = Number.isFinite(copies) && copies > 0 ? Math.floor(copies) : 1;
  return Math.max(0, Math.round(listPrice * bulkMultiplier(size.family, safeCopies, table)));
}

export function parsePixelHint(pixels: string): { width: number; height: number } | null {
  const match = pixels.match(/(\d+)\s*[×x]\s*(\d+)/i);
  if (!match) {
    return null;
  }
  return { width: Number(match[1]), height: Number(match[2]) };
}

export function printAspect(size: PrintSize): { width: number; height: number } {
  const match = size.cm.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)/i);
  if (!match) {
    return { width: 2, height: 3 };
  }
  return { width: Number(match[1]), height: Number(match[2]) };
}

export function photoQuality(
  fileWidth: number,
  fileHeight: number,
  targetWidth: number,
  targetHeight: number
): "good" | "soft" | "small" {
  if (fileWidth <= 0 || fileHeight <= 0 || targetWidth <= 0 || targetHeight <= 0) {
    return "soft";
  }
  const cover = Math.min(fileWidth / targetWidth, fileHeight / targetHeight);
  if (cover >= 0.85) {
    return "good";
  }
  if (cover >= 0.5) {
    return "soft";
  }
  return "small";
}

export function formatRs(value: number): string {
  return `Rs ${Math.round(value).toLocaleString("en-LK")}`;
}

export function whatsappHref(message: string): string {
  return `https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function describePrintOrder(input: {
  sizeLabel: string;
  finishLabel: string;
  photos: number;
  copies: number;
  total: number;
}): string {
  return [
    "Hello Siyatha, I would like a photo print order.",
    `Size: ${input.sizeLabel}`,
    `Paper: ${input.finishLabel}`,
    `Photos: ${input.photos}`,
    `Prints: ${input.copies}`,
    `Estimated total: ${formatRs(input.total)}`,
    "I will send the photos in this chat if they are not already uploaded on siyatha.lk.",
  ].join("\n");
}

export const HERO_PHOTO = photoImage;
export const HERO_PACKAGING = packagingImage;
export const HERO_CRAFT = craftImage;
