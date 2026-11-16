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
  { id: "4x6", family: "copies", label: "4×6 in", cm: "10×15 cm", price: 30, blurb: "Album size. The usual photo print." },
  { id: "5x7", family: "copies", label: "5×7 in", cm: "13×18 cm", price: 55, blurb: "A little larger for a desk frame." },
  { id: "6x8", family: "copies", label: "6×8 in", cm: "15×20 cm", price: 80, blurb: "Group photos and travel shots." },
  { id: "8x10", family: "enlargements", label: "8×10 in", cm: "20×25 cm", price: 140, blurb: "Frame size for a wall or a gift." },
  { id: "8x12", family: "enlargements", label: "8×12 in", cm: "20×30 cm", price: 180, blurb: "Wide scenes and family groups." },
  { id: "a4", family: "enlargements", label: "A4", cm: "21×29.7 cm", price: 220, blurb: "Poster-style print on photo paper." },
  { id: "a3", family: "enlargements", label: "A3", cm: "29.7×42 cm", price: 420, blurb: "The large print. Best from a clear photo." },
  { id: "passport-8", family: "passport", label: "Passport sheet", cm: "8 photos", price: 250, blurb: "Eight matching photos on one sheet." },
  { id: "visa-6", family: "passport", label: "Visa sheet", cm: "6 photos", price: 320, blurb: "Six photos. Confirm the official size first." },
  { id: "card-birthday", family: "cards", label: "Birthday card", cm: "5×7 in", price: 95, blurb: "Your photo on a birthday card." },
  { id: "card-thanks", family: "cards", label: "Thank-you card", cm: "5×7 in", price: 95, blurb: "A card for orders, weddings, and gifts." },
  { id: "card-invite", family: "cards", label: "Invitation", cm: "A5", price: 85, blurb: "Party and home invitations." },
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
      "JPG, PNG, and WEBP from a phone or camera. Each file can be up to 8 MB. We print borderless, so leave a little space around faces.",
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

export function sizesForFamily(family: PrintFamilyId): PrintSize[] {
  return PRINT_SIZES.filter((size) => size.family === family);
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

export function lowestFamilyPrice(family: PrintFamilyId): number {
  const prices = sizesForFamily(family).map((size) => size.price);
  return prices.length > 0 ? Math.min(...prices) : 0;
}

export function bulkMultiplier(family: PrintFamilyId, copies: number): number {
  if (family === "passport") {
    return 1;
  }

  if (copies >= 30) {
    return 0.8;
  }

  if (copies >= 12) {
    return 0.9;
  }

  return 1;
}

export function printUnitPrice(sizeId: string, copies: number): number | null {
  const size = findPrintSize(sizeId);
  if (!size) {
    return null;
  }

  const safeCopies = Number.isFinite(copies) && copies > 0 ? Math.floor(copies) : 1;
  return Math.max(1, Math.round(size.price * bulkMultiplier(size.family, safeCopies)));
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
