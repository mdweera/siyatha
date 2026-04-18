import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export const dynamic = "force-dynamic";

const seedProducts = [
  {
    name: "Apple iPhone 15 Pro Max",
    description:
      "Apple flagship with A17 Pro chip, 256GB storage, titanium body, and all-day battery life.",
    sku: "APPLE-15-PRO-MAX-256",
    barcode: "1234567890123",
    category: "Smartphones",
    brand: "Apple",
    images: [
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 360000,
    posPrice: 425000,
    onlinePrice: 415000,
    stockQty: 14,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Apple Care",
    specifications: { storage: "256GB", display: "6.7-inch OLED", chipset: "A17 Pro" },
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description:
      "Premium Samsung phone with S Pen support, powerful AI features, and 200MP camera system.",
    sku: "SAMSUNG-S24-ULTRA-256",
    barcode: "1234567890456",
    category: "Smartphones",
    brand: "Samsung",
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 330000,
    posPrice: 399000,
    onlinePrice: 389000,
    stockQty: 10,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Samsung Warranty",
    specifications: { storage: "256GB", display: "6.8-inch AMOLED", camera: "200MP" },
  },
  {
    name: "Asus ROG Zephyrus G14",
    description:
      "Performance gaming laptop with Ryzen 9 processor, RTX graphics, and 16GB RAM.",
    sku: "ASUS-ROG-G14-2025",
    barcode: "1234567890789",
    category: "Laptops",
    brand: "Asus",
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 430000,
    posPrice: 510000,
    onlinePrice: 495000,
    stockQty: 9,
    isPublishedOnline: true,
    warrantyPeriod: "2 Years Asus Warranty",
    specifications: { ram: "16GB", storage: "1TB SSD", gpu: "RTX 4060" },
  },
  {
    name: "MacBook Air M3 13-inch",
    description:
      "Ultra portable MacBook with M3 chip, exceptional battery life, and 13-inch Liquid Retina display.",
    sku: "APPLE-MBA-M3-13-256",
    barcode: "1234567890999",
    category: "Laptops",
    brand: "Apple",
    images: [
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 320000,
    posPrice: 369000,
    onlinePrice: 359000,
    stockQty: 11,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Apple Warranty",
    specifications: { ram: "8GB", storage: "256GB SSD", chipset: "Apple M3" },
  },
  {
    name: "Samsung 65 inch UHD 4K Smart TV",
    description:
      "Crystal clear 4K television ideal for movies, sports, and gaming with smart streaming apps.",
    sku: "SAMSUNG-TV-65-UHD-4K",
    barcode: "1234567891122",
    category: "Televisions",
    brand: "Samsung",
    images: [
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 198000,
    posPrice: 252000,
    onlinePrice: 242000,
    stockQty: 7,
    isPublishedOnline: true,
    warrantyPeriod: "3 Years Panel Warranty",
    specifications: { resolution: "4K UHD", size: "65-inch", os: "Tizen" },
  },
  {
    name: "LG 55 inch OLED evo TV",
    description:
      "Premium OLED display with deep blacks, vivid colors, and smooth gaming performance.",
    sku: "LG-TV-55-OLED-EVO",
    barcode: "1234567891455",
    category: "Televisions",
    brand: "LG",
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 245000,
    posPrice: 320000,
    onlinePrice: 309000,
    stockQty: 5,
    isPublishedOnline: true,
    warrantyPeriod: "2 Years LG Warranty",
    specifications: { resolution: "4K OLED", size: "55-inch", refreshRate: "120Hz" },
  },
  {
    name: "Sony WH-1000XM5 Wireless Headphones",
    description:
      "Industry-leading noise cancellation and up to 30-hour battery for immersive listening.",
    sku: "SONY-WH-1000XM5-BLK",
    barcode: "1234567891788",
    category: "Audio",
    brand: "Sony",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 92000,
    posPrice: 112000,
    onlinePrice: 105000,
    stockQty: 20,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Agent Warranty",
    specifications: { type: "Over-Ear", battery: "30 Hours", connectivity: "Bluetooth 5.2" },
  },
  {
    name: "JBL Flip 6 Portable Speaker",
    description:
      "Compact and waterproof portable speaker with punchy bass and clear vocals.",
    sku: "JBL-FLIP-6-BLUE",
    barcode: "1234567892013",
    category: "Audio",
    brand: "JBL",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 28000,
    posPrice: 36000,
    onlinePrice: 34000,
    stockQty: 32,
    isPublishedOnline: true,
    warrantyPeriod: "6 Months Warranty",
    specifications: { output: "30W", battery: "12 Hours", rating: "IP67" },
  },
  {
    name: "Apple Watch Series 9",
    description:
      "Advanced smartwatch with health tracking, GPS, and brighter always-on Retina display.",
    sku: "APPLE-WATCH-S9-45",
    barcode: "1234567892346",
    category: "Wearables",
    brand: "Apple",
    images: [
      "https://images.unsplash.com/photo-1579586337278-3f436f25d4d6?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 105000,
    posPrice: 132000,
    onlinePrice: 126000,
    stockQty: 18,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Apple Warranty",
    specifications: { size: "45mm", connectivity: "GPS", battery: "Up to 18 hours" },
  },
  {
    name: "Xiaomi Smart Band 8",
    description:
      "Affordable fitness tracker with colorful AMOLED display and all-day health monitoring.",
    sku: "XIAOMI-BAND-8",
    barcode: "1234567892679",
    category: "Wearables",
    brand: "Xiaomi",
    images: [
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 11500,
    posPrice: 16000,
    onlinePrice: 14900,
    stockQty: 60,
    isPublishedOnline: true,
    warrantyPeriod: "6 Months Warranty",
    specifications: { display: "AMOLED", battery: "16 Days", tracking: "Heart Rate + Sleep" },
  },
  {
    name: "Anker 20,000mAh Power Bank",
    description:
      "High-capacity power bank with fast charging and dual USB output for travel.",
    sku: "ANKER-PB-20000",
    barcode: "1234567892901",
    category: "Power Banks & Batteries",
    brand: "Anker",
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 9500,
    posPrice: 14000,
    onlinePrice: 12900,
    stockQty: 55,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { capacity: "20,000mAh", output: "20W", ports: "2x USB + USB-C" },
  },
  {
    name: "Baseus 10,000mAh Magnetic Power Bank",
    description:
      "Slim magnetic power bank with wireless charging support and USB-C fast charging.",
    sku: "BASEUS-PB-10000-MAG",
    barcode: "1234567892902",
    category: "Power Banks & Batteries",
    brand: "Baseus",
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 7800,
    posPrice: 11900,
    onlinePrice: 10900,
    stockQty: 48,
    isPublishedOnline: true,
    warrantyPeriod: "6 Months Warranty",
    specifications: { capacity: "10,000mAh", output: "20W", features: "MagSafe Compatible" },
  },
  {
    name: "UGREEN 30,000mAh 65W Power Bank",
    description:
      "High-output power bank for laptops, tablets, and multiple fast-charging devices.",
    sku: "UGREEN-PB-30000-65W",
    barcode: "1234567892903",
    category: "Power Banks & Batteries",
    brand: "UGREEN",
    images: [
      "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 16500,
    posPrice: 23900,
    onlinePrice: 22500,
    stockQty: 22,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { capacity: "30,000mAh", output: "65W PD", ports: "2x USB-C + USB-A" },
  },
  {
    name: "Xiaomi 5,000mAh Pocket Power Bank",
    description:
      "Compact entry-level mini power bank for quick top-ups during daily commutes.",
    sku: "XIAOMI-PB-5000-MINI",
    barcode: "1234567892904",
    category: "Power Banks & Batteries",
    brand: "Xiaomi",
    images: [
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 3200,
    posPrice: 5400,
    onlinePrice: 4900,
    stockQty: 85,
    isPublishedOnline: true,
    warrantyPeriod: "3 Months Warranty",
    specifications: { capacity: "5,000mAh", output: "10W", weight: "120g" },
  },
  {
    name: "Panasonic Eneloop AA Rechargeable Batteries 4-Pack",
    description:
      "Long-life rechargeable AA battery set suitable for remotes, cameras, and toys.",
    sku: "PANASONIC-AA-RECH-4",
    barcode: "1234567892905",
    category: "Power Banks & Batteries",
    brand: "Panasonic",
    images: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 1800,
    posPrice: 3200,
    onlinePrice: 2900,
    stockQty: 120,
    isPublishedOnline: true,
    warrantyPeriod: "No Warranty",
    specifications: { type: "AA Rechargeable", quantity: "4 cells", cycleLife: "Up to 2100 cycles" },
  },
  {
    name: "SellerBox Corrugated Shipping Box Pack (25)",
    description:
      "Durable corrugated carton bundle for eCommerce parcel dispatch and product safety.",
    sku: "SELLERBOX-CARTON-25",
    barcode: "1234567892906",
    category: "Packaging Solutions",
    brand: "SellerBox",
    images: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 1900,
    posPrice: 3200,
    onlinePrice: 2950,
    stockQty: 70,
    isPublishedOnline: true,
    warrantyPeriod: "No Warranty",
    specifications: { quantity: "25 boxes", material: "3-ply corrugated", size: "Mixed S/M" },
  },
  {
    name: "Bubble Wrap Roll 100m",
    description:
      "Protective bubble wrap for fragile products, ideal for glass, electronics, and cosmetics.",
    sku: "PACK-BUBBLE-ROLL-100M",
    barcode: "1234567892907",
    category: "Packaging Solutions",
    brand: "Siyatha Pack",
    images: [
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 1450,
    posPrice: 2400,
    onlinePrice: 2200,
    stockQty: 95,
    isPublishedOnline: true,
    warrantyPeriod: "No Warranty",
    specifications: { length: "100m", width: "50cm", thickness: "Standard" },
  },
  {
    name: "Waterproof Courier Bags 100-Pack",
    description:
      "Tamper-resistant courier poly mailers for social sellers and online business shipping.",
    sku: "PACK-COURIER-BAG-100",
    barcode: "1234567892908",
    category: "Packaging Solutions",
    brand: "Siyatha Pack",
    images: [
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 1300,
    posPrice: 2250,
    onlinePrice: 1990,
    stockQty: 140,
    isPublishedOnline: true,
    warrantyPeriod: "No Warranty",
    specifications: { quantity: "100 bags", material: "LDPE", feature: "Waterproof + tamper strip" },
  },
  {
    name: "Fragile + Thank You Label Pack (500)",
    description:
      "Brand-friendly sticker bundle for parcel handling instructions and customer appreciation.",
    sku: "PACK-LABEL-MIX-500",
    barcode: "1234567892909",
    category: "Packaging Solutions",
    brand: "Siyatha Pack",
    images: [
      "https://images.unsplash.com/photo-1577869963914-8d8c5f8c6f46?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 950,
    posPrice: 1700,
    onlinePrice: 1490,
    stockQty: 160,
    isPublishedOnline: true,
    warrantyPeriod: "No Warranty",
    specifications: { quantity: "500 labels", includes: "Fragile + Thank You", finish: "Matte" },
  },
  {
    name: "Logitech MX Master 3S Mouse",
    description:
      "Ergonomic productivity mouse with precision tracking and silent clicks.",
    sku: "LOGI-MX-MASTER-3S",
    barcode: "1234567893234",
    category: "Accessories",
    brand: "Logitech",
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 29000,
    posPrice: 39000,
    onlinePrice: 36900,
    stockQty: 24,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Logitech Warranty",
    specifications: { dpi: "8000", connectivity: "Bluetooth + Bolt", battery: "70 Days" },
  },
  {
    name: "Dell 27 inch QHD Monitor",
    description:
      "Premium monitor for desk setup with crisp color and 75Hz refresh rate for work and content.",
    sku: "DELL-MONITOR-27-QHD",
    barcode: "1234567893301",
    category: "Personal Table Setup",
    brand: "Dell",
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 62000,
    posPrice: 82500,
    onlinePrice: 78500,
    stockQty: 17,
    isPublishedOnline: true,
    warrantyPeriod: "2 Years Warranty",
    specifications: { size: "27 inch", resolution: "QHD", panel: "IPS" },
  },
  {
    name: "Xiaomi 24 inch FHD Monitor",
    description:
      "Affordable monitor for home table setup and daily office workflows.",
    sku: "XIAOMI-MONITOR-24-FHD",
    barcode: "1234567893302",
    category: "Personal Table Setup",
    brand: "Xiaomi",
    images: [
      "https://images.unsplash.com/photo-1587831990711-23ca6441447b?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 24800,
    posPrice: 34900,
    onlinePrice: 32900,
    stockQty: 26,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { size: "24 inch", resolution: "FHD", panel: "VA" },
  },
  {
    name: "HyperX QuadCast S USB Microphone",
    description:
      "Streaming microphone with RGB and anti-vibration mount for recording and creator use.",
    sku: "HYPERX-MIC-QUADCAST-S",
    barcode: "1234567893303",
    category: "Personal Table Setup",
    brand: "HyperX",
    images: [
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 41800,
    posPrice: 55900,
    onlinePrice: 52500,
    stockQty: 19,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { pickupPattern: "4 patterns", connection: "USB-C", lighting: "RGB" },
  },
  {
    name: "Boya BY-M1 Lavalier Microphone",
    description:
      "Budget microphone for phone recording, interviews, and table setup voice capture.",
    sku: "BOYA-MIC-BY-M1-3.5",
    barcode: "1234567893304",
    category: "Personal Table Setup",
    brand: "Boya",
    images: [
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 3900,
    posPrice: 7200,
    onlinePrice: 6500,
    stockQty: 74,
    isPublishedOnline: true,
    warrantyPeriod: "6 Months Warranty",
    specifications: { type: "Lavalier", connector: "3.5mm", cable: "6m" },
  },
  {
    name: "Elgato Key Light Air Record Light",
    description:
      "Premium record light with app control for creator table and studio lighting.",
    sku: "ELGATO-KEYLIGHT-AIR",
    barcode: "1234567893305",
    category: "Personal Table Setup",
    brand: "Elgato",
    images: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 51000,
    posPrice: 68000,
    onlinePrice: 64500,
    stockQty: 9,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { brightness: "1400 lumens", control: "Wi-Fi app", colorTemp: "2900-7000K" },
  },
  {
    name: "Logitech C922 Pro Webcam Camera",
    description:
      "Full HD webcam camera for meetings, streaming, and desktop creator setup.",
    sku: "LOGI-WEBCAM-C922-PRO",
    barcode: "1234567893306",
    category: "Personal Table Setup",
    brand: "Logitech",
    images: [
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 18800,
    posPrice: 26900,
    onlinePrice: 24900,
    stockQty: 28,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { resolution: "1080p", fps: "30", mount: "Tripod compatible" },
  },
  {
    name: "Keychron K2 Wireless Keyboard",
    description:
      "Mechanical keyboard for productivity table setup with hot-swap and wireless mode.",
    sku: "KEYCHRON-K2-KEYBOARD",
    barcode: "1234567893307",
    category: "Personal Table Setup",
    brand: "Keychron",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 21800,
    posPrice: 31900,
    onlinePrice: 28900,
    stockQty: 21,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { layout: "75%", connectivity: "Bluetooth + Cable", switch: "Hot-swap" },
  },
  {
    name: "RGB Desk Mat Table Deco 90cm",
    description:
      "Large desk mat table deco accessory with edge RGB for gaming and creator setup.",
    sku: "RGB-DESKMAT-DECO-90",
    barcode: "1234567893308",
    category: "Personal Table Setup",
    brand: "Siyatha Gear",
    images: [
      "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 4200,
    posPrice: 7800,
    onlinePrice: 6900,
    stockQty: 65,
    isPublishedOnline: true,
    warrantyPeriod: "No Warranty",
    specifications: { size: "900x400mm", feature: "RGB edge", material: "Micro-woven cloth" },
  },
  {
    name: "Ulanzi 10 inch Ringlight Creator Kit",
    description:
      "Compact ringlight with mobile holder for beginner vlog and selfie content.",
    sku: "ULANZI-RINGLIGHT-10",
    barcode: "1234567893401",
    category: "Vlog Creator Kit",
    brand: "Ulanzi",
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 3600,
    posPrice: 6500,
    onlinePrice: 5900,
    stockQty: 83,
    isPublishedOnline: true,
    warrantyPeriod: "6 Months Warranty",
    specifications: { ringSize: "10 inch", mount: "Phone holder", power: "USB" },
  },
  {
    name: "Neewer 18 inch Ring Light Pro Kit",
    description:
      "Large ring light setup for vlog studio lighting and beauty content creation.",
    sku: "NEEWER-RINGLIGHT-18",
    barcode: "1234567893402",
    category: "Vlog Creator Kit",
    brand: "Neewer",
    images: [
      "https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 12200,
    posPrice: 19900,
    onlinePrice: 17900,
    stockQty: 31,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { ringSize: "18 inch", stand: "Included", colorTemp: "3200K-5600K" },
  },
  {
    name: "DJI Osmo Mobile 6 Gimbal",
    description:
      "Premium smartphone gimbal for stable vlogging, travel clips, and creator reels.",
    sku: "DJI-GIMBAL-OM6",
    barcode: "1234567893403",
    category: "Vlog Creator Kit",
    brand: "DJI",
    images: [
      "https://images.unsplash.com/photo-1551817958-20204aa1f0f9?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 40800,
    posPrice: 56500,
    onlinePrice: 52900,
    stockQty: 14,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { axis: "3-axis", battery: "6.5 hours", control: "ActiveTrack" },
  },
  {
    name: "Zhiyun Smooth 5S Gimbal",
    description:
      "Creator gimbal with fill light and advanced control for mobile video content.",
    sku: "ZHIYUN-GIMBAL-5S",
    barcode: "1234567893404",
    category: "Vlog Creator Kit",
    brand: "Zhiyun",
    images: [
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 34100,
    posPrice: 46900,
    onlinePrice: 43900,
    stockQty: 12,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { axis: "3-axis", feature: "Built-in fill light", payload: "300g" },
  },
  {
    name: "GoPro Hero 12 Action Cam",
    description:
      "Flagship action cam for vlogging, adventure content, and cinematic creator shots.",
    sku: "GOPRO-HERO12-ACTIONCAM",
    barcode: "1234567893405",
    category: "Vlog Creator Kit",
    brand: "GoPro",
    images: [
      "https://images.unsplash.com/photo-1477968684040-3d7ea8f5b4f8?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 99000,
    posPrice: 139000,
    onlinePrice: 129000,
    stockQty: 8,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { video: "5.3K", stabilization: "HyperSmooth", waterproof: "10m" },
  },
  {
    name: "Creator Studio Light 40W",
    description:
      "Portable studio light for vlogging and content creator shooting sessions.",
    sku: "CREATOR-STUDIO-LIGHT-40W",
    barcode: "1234567893406",
    category: "Vlog Creator Kit",
    brand: "Siyatha Creator",
    images: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 9800,
    posPrice: 16800,
    onlinePrice: 14900,
    stockQty: 36,
    isPublishedOnline: true,
    warrantyPeriod: "6 Months Warranty",
    specifications: { power: "40W", mount: "1/4 screw", colorTemp: "3200K-5600K" },
  },
  {
    name: "WD 1TB External Hard Drive",
    description:
      "Reliable external hard drive for backups, media transfer, and personal accessories storage.",
    sku: "WD-EXT-HDD-1TB",
    barcode: "1234567893501",
    category: "Personal Accessories",
    brand: "WD",
    images: [
      "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 17900,
    posPrice: 26900,
    onlinePrice: 24900,
    stockQty: 42,
    isPublishedOnline: true,
    warrantyPeriod: "2 Years Warranty",
    specifications: { storage: "1TB", interface: "USB 3.0", formFactor: "2.5 inch" },
  },
  {
    name: "Seagate 2TB External Hard Drive",
    description:
      "Portable 2TB hard drive for creators and office users needing bigger external storage.",
    sku: "SEAGATE-EXT-HDD-2TB",
    barcode: "1234567893502",
    category: "Personal Accessories",
    brand: "Seagate",
    images: [
      "https://images.unsplash.com/photo-1611746872915-64382b5c76da?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 27200,
    posPrice: 39800,
    onlinePrice: 36900,
    stockQty: 27,
    isPublishedOnline: true,
    warrantyPeriod: "2 Years Warranty",
    specifications: { storage: "2TB", interface: "USB 3.0", type: "HDD" },
  },
  {
    name: "Samsung T7 1TB External SSD",
    description:
      "Fast external SSD for editors and gamers with compact premium design.",
    sku: "SAMSUNG-EXT-SSD-T7-1TB",
    barcode: "1234567893503",
    category: "Personal Accessories",
    brand: "Samsung",
    images: [
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 36900,
    posPrice: 52800,
    onlinePrice: 49500,
    stockQty: 19,
    isPublishedOnline: true,
    warrantyPeriod: "3 Years Warranty",
    specifications: { storage: "1TB", type: "SSD", speed: "Up to 1050MB/s" },
  },
  {
    name: "Anker 10,000mAh PD Power Bank",
    description:
      "Compact power bank with USB-C PD charging and travel-friendly battery capacity.",
    sku: "ANKER-PB-10000-PD",
    barcode: "1234567893504",
    category: "Personal Accessories",
    brand: "Anker",
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 7900,
    posPrice: 11900,
    onlinePrice: 10900,
    stockQty: 58,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { capacity: "10,000mAh", output: "20W PD", ports: "USB-C + USB-A" },
  },
  {
    name: "Baseus 20,000mAh 22.5W Battery Power Bank",
    description:
      "High-capacity battery power bank with digital display and multi-port output.",
    sku: "BASEUS-PB-20000-22W",
    barcode: "1234567893505",
    category: "Personal Accessories",
    brand: "Baseus",
    images: [
      "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 10200,
    posPrice: 16400,
    onlinePrice: 14900,
    stockQty: 46,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { capacity: "20,000mAh", output: "22.5W", display: "LED" },
  },
  {
    name: "JBL Tune 760NC Headphone",
    description:
      "Wireless JBL headphone with ANC for daily music and call experience.",
    sku: "JBL-TUNE-760NC-HEADPHONE",
    barcode: "1234567893506",
    category: "Personal Accessories",
    brand: "JBL",
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 21300,
    posPrice: 31900,
    onlinePrice: 28900,
    stockQty: 29,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { type: "Headphone", battery: "35 hours", anc: "Yes" },
  },
  {
    name: "Sony WH-CH720N Headset",
    description:
      "Sony wireless headset with clear voice call quality and active noise cancellation.",
    sku: "SONY-WH-CH720N-HEADSET",
    barcode: "1234567893507",
    category: "Personal Accessories",
    brand: "Sony",
    images: [
      "https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 35200,
    posPrice: 49900,
    onlinePrice: 46900,
    stockQty: 15,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { type: "Headset", battery: "35 hours", anc: "Yes" },
  },
  {
    name: "UGREEN Charger + Cable Accessory Kit",
    description:
      "Daily accessory bundle with fast charger and USB-C cable for phones and tablets.",
    sku: "UGREEN-CHARGER-CABLE-KIT",
    barcode: "1234567893508",
    category: "Personal Accessories",
    brand: "UGREEN",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 5900,
    posPrice: 9800,
    onlinePrice: 8900,
    stockQty: 73,
    isPublishedOnline: true,
    warrantyPeriod: "6 Months Warranty",
    specifications: { charger: "30W", cable: "Type-C", set: "Adapter + cable" },
  },
  {
    name: "POS Thermal Receipt Bill Printer 80mm",
    description:
      "Reliable thermal printer for POS billing, receipt printing, and store counters.",
    sku: "POS-THERMAL-PRINTER-80MM",
    barcode: "1234567893601",
    category: "Online Store Tools",
    brand: "XPrinter",
    images: [
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 25100,
    posPrice: 35900,
    onlinePrice: 32900,
    stockQty: 23,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { width: "80mm", connection: "USB + LAN", useCase: "POS receipt printer" },
  },
  {
    name: "Sunmi V2S POS Bill Printer Terminal",
    description:
      "Premium handheld POS terminal with built-in bill printer for mobile store operations.",
    sku: "SUNMI-V2S-POS-TERMINAL",
    barcode: "1234567893602",
    category: "Online Store Tools",
    brand: "Sunmi",
    images: [
      "https://images.unsplash.com/photo-1556740761-a1a2c31598f9?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 119000,
    posPrice: 159000,
    onlinePrice: 149000,
    stockQty: 7,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { os: "Android", printer: "Built-in thermal", connectivity: "4G + Wi-Fi" },
  },
  {
    name: "Casio MJ-120D Business Calculator",
    description:
      "Trusted calculator for online store bookkeeping, invoice totals, and stock cost checks.",
    sku: "CASIO-CALCULATOR-MJ120D",
    barcode: "1234567893603",
    category: "Online Store Tools",
    brand: "Casio",
    images: [
      "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 3900,
    posPrice: 7600,
    onlinePrice: 6900,
    stockQty: 64,
    isPublishedOnline: true,
    warrantyPeriod: "6 Months Warranty",
    specifications: { digits: "12", power: "Dual", useCase: "Business calculations" },
  },
  {
    name: "Honeywell USB Barcode Scanner POS",
    description:
      "Fast barcode scanner for POS billing desks and inventory operations in retail stores.",
    sku: "HONEYWELL-BARCODE-SCANNER-USB",
    barcode: "1234567893604",
    category: "Online Store Tools",
    brand: "Honeywell",
    images: [
      "https://images.unsplash.com/photo-1589913188900-85dae523342b?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 10800,
    posPrice: 16900,
    onlinePrice: 14900,
    stockQty: 33,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { type: "1D/2D", connection: "USB", speed: "300 scans/s" },
  },
  {
    name: "Zebra ZD220 Label Printer",
    description:
      "Business label printer for courier labels, barcode labels, and online store packaging workflows.",
    sku: "ZEBRA-LABEL-PRINTER-ZD220",
    barcode: "1234567893605",
    category: "Online Store Tools",
    brand: "Zebra",
    images: [
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 61500,
    posPrice: 83500,
    onlinePrice: 78500,
    stockQty: 11,
    isPublishedOnline: true,
    warrantyPeriod: "1 Year Warranty",
    specifications: { printType: "Thermal", width: "4 inch", useCase: "Label + barcode" },
  },
  {
    name: "Retail Store Packaging Starter Pack (50 Orders)",
    description:
      "Complete packaging starter bundle for small online stores with boxes, tape, and labels.",
    sku: "STORE-PACKAGING-STARTER-50",
    barcode: "1234567893606",
    category: "Online Store Tools",
    brand: "Siyatha Pack",
    images: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 6900,
    posPrice: 11200,
    onlinePrice: 9900,
    stockQty: 52,
    isPublishedOnline: true,
    warrantyPeriod: "No Warranty",
    specifications: { includes: "Box + tape + labels", orderCapacity: "50 orders", useCase: "Store packaging" },
  },
  {
    name: "Online System Inventory POS License (1 Year)",
    description:
      "Cloud online system and POS inventory software license for retail business automation.",
    sku: "ONLINE-SYSTEM-INVENTORY-LICENSE",
    barcode: "1234567893607",
    category: "Online Store Tools",
    brand: "Xoftify",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    ],
    costPrice: 52000,
    posPrice: 69900,
    onlinePrice: 65000,
    stockQty: 120,
    isPublishedOnline: true,
    warrantyPeriod: "12 Months Support",
    specifications: { license: "1 year", modules: "POS + inventory + reports", access: "Cloud" },
  },
];

const seedUsers = [
  {
    name: "Siyatha Admin",
    email: "admin@siyatha.lk",
    phone: "+94710000001",
    role: "ADMIN",
    password: "Admin@123",
    favoritesSkus: ["DELL-MONITOR-27-QHD", "GOPRO-HERO12-ACTIONCAM", "SUNMI-V2S-POS-TERMINAL"],
  },
  {
    name: "Siyatha Staff",
    email: "staff@siyatha.lk",
    phone: "+94710000002",
    role: "STAFF",
    password: "Staff@123",
    favoritesSkus: ["POS-THERMAL-PRINTER-80MM", "ONLINE-SYSTEM-INVENTORY-LICENSE"],
  },
  {
    name: "Nimal Perera",
    email: "nimal@example.com",
    phone: "+94771234567",
    role: "USER",
    password: "User@123",
    favoritesSkus: ["JBL-TUNE-760NC-HEADPHONE", "WD-EXT-HDD-1TB", "ANKER-PB-20000"],
  },
  {
    name: "Kasuni Silva",
    email: "kasuni@example.com",
    phone: "+94779876543",
    role: "USER",
    password: "User@123",
    favoritesSkus: ["ULANZI-RINGLIGHT-10", "DJI-GIMBAL-OM6", "BOYA-MIC-BY-M1-3.5"],
  },
  {
    name: "Ruwan Fernando",
    email: "ruwan@example.com",
    phone: "+94773456789",
    role: "USER",
    password: "User@123",
    favoritesSkus: ["KEYCHRON-K2-KEYBOARD", "ZEBRA-LABEL-PRINTER-ZD220", "CASIO-CALCULATOR-MJ120D"],
  },
];

const seedOrders = [
  {
    orderNumber: "DEMO-SO-1001",
    phone: "+94771234567",
    source: "ONLINE",
    status: "delivered",
    paymentMethod: "card",
    trackingNumber: "TRACK-LK-1001",
    courierService: "Domex",
    shippingAddress: {
      firstName: "Nimal",
      lastName: "Perera",
      email: "nimal@example.com",
      phone: "+94771234567",
      address: "No. 123, Galle Road",
      city: "Colombo",
      postalCode: "00300",
      notes: "Call before delivery",
    },
    itemSpecs: [
      { sku: "DELL-MONITOR-27-QHD", quantity: 1 },
      { sku: "ANKER-PB-20000", quantity: 1 },
    ],
  },
  {
    orderNumber: "DEMO-SO-1002",
    phone: "+94779876543",
    source: "ONLINE",
    status: "processing",
    paymentMethod: "bank_transfer",
    shippingAddress: {
      firstName: "Kasuni",
      lastName: "Silva",
      email: "kasuni@example.com",
      phone: "+94779876543",
      address: "No. 45, Kandy Road",
      city: "Kandy",
      postalCode: "20000",
      notes: "Leave at reception",
    },
    itemSpecs: [
      { sku: "ULANZI-RINGLIGHT-10", quantity: 1 },
      { sku: "DJI-GIMBAL-OM6", quantity: 1 },
      { sku: "BOYA-MIC-BY-M1-3.5", quantity: 2 },
    ],
  },
  {
    orderNumber: "DEMO-SO-1003",
    phone: "+94773456789",
    source: "ONLINE",
    status: "pending",
    paymentMethod: "cod",
    shippingAddress: {
      firstName: "Ruwan",
      lastName: "Fernando",
      email: "ruwan@example.com",
      phone: "+94773456789",
      address: "No. 12, Dutugemunu Street",
      city: "Galle",
      postalCode: "80000",
      notes: "Deliver after 2 PM",
    },
    itemSpecs: [
      { sku: "POS-THERMAL-PRINTER-80MM", quantity: 1 },
      { sku: "CASIO-CALCULATOR-MJ120D", quantity: 2 },
    ],
  },
  {
    orderNumber: "DEMO-SO-1004",
    phone: "+94710000002",
    source: "POS",
    status: "shipped",
    paymentMethod: "cash",
    trackingNumber: "TRACK-LK-1004",
    courierService: "Pronto",
    shippingAddress: {
      firstName: "Siyatha",
      lastName: "Staff",
      email: "staff@siyatha.lk",
      phone: "+94710000002",
      address: "Siyatha Online, Main Branch",
      city: "Colombo",
      postalCode: "00100",
      notes: "POS dispatch sample order",
    },
    itemSpecs: [
      { sku: "HONEYWELL-BARCODE-SCANNER-USB", quantity: 1 },
      { sku: "STORE-PACKAGING-STARTER-50", quantity: 2 },
    ],
  },
  {
    orderNumber: "DEMO-SO-1005",
    phone: "+94771234567",
    source: "ONLINE",
    status: "cancelled",
    paymentMethod: "card",
    shippingAddress: {
      firstName: "Nimal",
      lastName: "Perera",
      email: "nimal@example.com",
      phone: "+94771234567",
      address: "No. 123, Galle Road",
      city: "Colombo",
      postalCode: "00300",
      notes: "Customer requested cancellation",
    },
    itemSpecs: [{ sku: "SUNMI-V2S-POS-TERMINAL", quantity: 1 }],
  },
];

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const shouldReset = new URL(request.url).searchParams.get("reset") === "1";

    const productSkus = seedProducts.map((item) => item.sku);
    const userPhones = seedUsers.map((item) => item.phone);
    const orderNumbers = seedOrders.map((item) => item.orderNumber);

    if (shouldReset) {
      await Promise.all([
        Product.deleteMany({ sku: { $in: productSkus } }),
        User.deleteMany({ phone: { $in: userPhones } }),
        Order.deleteMany({ orderNumber: { $in: orderNumbers } }),
      ]);
    }

    for (const product of seedProducts) {
      await Product.findOneAndUpdate({ sku: product.sku }, product, {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      });
    }

    const products = await Product.find({ sku: { $in: productSkus } }).lean().exec();
    const productBySku = new Map(products.map((product: any) => [product.sku, product]));

    for (const user of seedUsers) {
      const hashedPassword = await hash(user.password, 12);
      await User.findOneAndUpdate(
        { phone: user.phone },
        {
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          password: hashedPassword,
        },
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }
      );
    }

    const users = await User.find({ phone: { $in: userPhones } }).lean().exec();
    const userByPhone = new Map(users.map((user: any) => [user.phone, user]));

    for (const user of seedUsers) {
      const favoriteIds = (user.favoritesSkus || [])
        .map((sku) => productBySku.get(sku)?._id)
        .filter(Boolean);

      await User.findOneAndUpdate(
        { phone: user.phone },
        { favorites: favoriteIds },
        { returnDocument: "after" }
      );
    }

    for (const order of seedOrders) {
      const customer = userByPhone.get(order.phone);

      const items = order.itemSpecs.map((entry) => {
        const product = productBySku.get(entry.sku);
        if (!product) {
          throw new Error(`Seed order references missing SKU: ${entry.sku}`);
        }

        const price = product.onlinePrice || product.posPrice;
        return {
          productId: product._id,
          name: product.name,
          quantity: entry.quantity,
          price,
          image: product.images?.[0] || "",
          subtotal: price * entry.quantity,
        };
      });

      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

      await Order.findOneAndUpdate(
        { orderNumber: order.orderNumber },
        {
          userId: customer?._id,
          customerName: customer?.name,
          phone: order.phone,
          source: order.source,
          items,
          totalAmount,
          status: order.status,
          orderNumber: order.orderNumber,
          paymentMethod: order.paymentMethod,
          shippingAddress: order.shippingAddress,
          trackingNumber: order.trackingNumber,
          courierService: order.courierService,
        },
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }
      );
    }

    const orderStatusCounts = await Order.aggregate([
      { $match: { orderNumber: { $in: orderNumbers } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
      { $sort: { status: 1 } },
    ]);

    return NextResponse.json({
      message: "Comprehensive demo seed completed successfully.",
      resetApplied: shouldReset,
      summary: {
        products: products.length,
        users: users.length,
        orders: orderNumbers.length,
        orderStatusCounts,
      },
      testCredentials: [
        { role: "ADMIN", phone: "+94710000001", password: "Admin@123" },
        { role: "STAFF", phone: "+94710000002", password: "Staff@123" },
        { role: "USER", phone: "+94771234567", password: "User@123" },
      ],
      usage: {
        runAgain: "/api/seed",
        forceResetAndReseed: "/api/seed?reset=1",
      },
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { message: "Failed to seed demo data", error: error.message },
      { status: 500 }
    );
  }
}