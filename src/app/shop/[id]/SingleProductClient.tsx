"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  Check,
  MessageCircle,
  Minus,
  Package,
  PhoneCall,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useSession } from "next-auth/react";

type ProductData = {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  sku?: string;
  images?: string[];
  onlinePrice?: number;
  posPrice?: number;
  stockQty?: number;
  warrantyPeriod?: string;
  specifications?: Record<string, string>;
};

type RelatedProduct = {
  _id: string;
  name: string;
  category?: string;
  images?: string[];
  onlinePrice?: number;
  posPrice?: number;
};

interface SingleProductProps {
  product: ProductData;
  relatedProducts?: RelatedProduct[];
}

type CustomerOrderInfo = {
  name: string;
  phone: string;
  city: string;
  address: string;
};

const ORDER_PROFILE_STORAGE_KEY = "siyatha-whatsapp-order-profile";

export default function SingleProductClient({ product, relatedProducts = [] }: SingleProductProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const addToCart = useCartStore((state) => state.addToCart);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "shipping">("overview");
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerOrderInfo>({
    name: "",
    phone: "",
    city: "",
    address: "",
  });

  const price = Number(product.onlinePrice ?? product.posPrice ?? 0);
  const originalPrice =
    typeof product.onlinePrice === "number" && typeof product.posPrice === "number"
      ? product.posPrice
      : null;
  const savings = originalPrice && originalPrice > price ? originalPrice - price : 0;
  const discount = originalPrice && originalPrice > price ? Math.round((savings / originalPrice) * 100) : 0;

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ["https://placehold.co/1000x800?text=No+Image"];
  const activeImageIndex = activeImage < images.length ? activeImage : 0;

  const stockQty = Number(product.stockQty ?? 0);
  const inStock = stockQty > 0;

  const specEntries = useMemo(() => {
    const specs = product.specifications ?? {};
    return Object.entries(specs).filter(([key, value]) => Boolean(key) && Boolean(value));
  }, [product.specifications]);

  const keyHighlights = [
    product.warrantyPeriod ? `${product.warrantyPeriod} warranty` : "Warranty included",
    inStock ? "Ready stock available" : "Pre-order availability",
    "Island-wide delivery",
    "Secure checkout and support",
  ];

  const formatCurrency = (value: number) => `Rs ${value.toLocaleString()}`;

  const whatsappNumber = useMemo(() => {
    return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+94766609143").replace(/[^0-9]/g, "");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedProfile = window.localStorage.getItem(ORDER_PROFILE_STORAGE_KEY);
    if (!savedProfile) return;

    try {
      const parsed = JSON.parse(savedProfile) as Partial<CustomerOrderInfo>;
      setCustomerInfo((prev) => ({
        ...prev,
        name: typeof parsed.name === "string" ? parsed.name : prev.name,
        phone: typeof parsed.phone === "string" ? parsed.phone : prev.phone,
        city: typeof parsed.city === "string" ? parsed.city : prev.city,
        address: typeof parsed.address === "string" ? parsed.address : prev.address,
      }));
    } catch {
      window.localStorage.removeItem(ORDER_PROFILE_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    setCustomerInfo((prev) => ({
      ...prev,
      name: prev.name || session?.user?.name || "",
      phone: prev.phone || session?.user?.phone || "",
    }));
  }, [session?.user?.name, session?.user?.phone]);

  const hasMissingOrderInfo = (info: CustomerOrderInfo) => {
    return !info.name.trim() || !info.phone.trim() || !info.city.trim();
  };

  const buildWhatsAppOrderLink = (info: CustomerOrderInfo) => {
    if (!whatsappNumber) return null;

    const orderTotal = price * quantity;
    const pageLink = typeof window !== "undefined" ? window.location.href : "";

    const message = [
      "Hello Siyatha Online, I would like to place this order.",
      "",
      "*Product Details*",
      `- Product: ${product.name}`,
      `- SKU: ${product.sku || "N/A"}`,
      `- Category: ${product.category || "N/A"}`,
      `- Unit Price: ${formatCurrency(price)}`,
      `- Quantity: ${quantity}`,
      `- Total: ${formatCurrency(orderTotal)}`,
      "",
      "*Customer Details*",
      `- Name: ${info.name.trim()}`,
      `- Phone: ${info.phone.trim()}`,
      `- City: ${info.city.trim()}`,
      `- Address: ${info.address.trim() || "Will share on call"}`,
      pageLink ? `- Product Link: ${pageLink}` : "",
      "",
      "Please confirm availability and delivery.",
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  const openWhatsAppOrder = (info: CustomerOrderInfo) => {
    const normalizedPhone = info.phone.replace(/[^0-9]/g, "");
    if (normalizedPhone.length < 9) {
      toast.error("Please enter a valid phone number.");
      return false;
    }

    const orderLink = buildWhatsAppOrderLink(info);
    if (!orderLink) {
      toast.error("WhatsApp ordering is currently unavailable.");
      return false;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(ORDER_PROFILE_STORAGE_KEY, JSON.stringify(info));
      window.open(orderLink, "_blank", "noopener,noreferrer");
    }

    toast.success("Opening WhatsApp with your order details");
    return true;
  };

  const handleWhatsAppOrderClick = () => {
    const enrichedInfo: CustomerOrderInfo = {
      ...customerInfo,
      name: customerInfo.name.trim() || session?.user?.name || "",
      phone: customerInfo.phone.trim() || session?.user?.phone || "",
      city: customerInfo.city,
      address: customerInfo.address,
    };

    setCustomerInfo(enrichedInfo);

    if (hasMissingOrderInfo(enrichedInfo)) {
      setShowWhatsAppPopup(true);
      return;
    }

    openWhatsAppOrder(enrichedInfo);
  };

  const handleWhatsAppPopupSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (hasMissingOrderInfo(customerInfo)) {
      toast.error("Please fill name, phone, and city to continue.");
      return;
    }

    const success = openWhatsAppOrder(customerInfo);
    if (success) {
      setShowWhatsAppPopup(false);
    }
  };

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error("This product is currently out of stock.");
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        _id: product._id,
        name: product.name,
        price,
        image: images[activeImageIndex],
      });
    }

    toast.success(`Added ${quantity} item${quantity > 1 ? "s" : ""} to cart`);
  };

  const handleBuyNow = () => {
    if (!inStock) {
      toast.error("This product is currently out of stock.");
      return;
    }

    handleAddToCart();
    router.push("/cart");
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description || product.name,
          url: window.location.href,
        });
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied");
    } catch {
      toast.error("Unable to share right now");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
          <Link href="/" className="hover:text-cyan-700">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-cyan-700">Shop</Link>
          <span>/</span>
          <span className="truncate text-slate-700">{product.name}</span>
        </nav>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
        >
          <ArrowLeft size={16} /> Back to shop
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-card rounded-[1.75rem] p-5 sm:p-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-cyan-100 bg-white">
            <Image
              src={images[activeImageIndex]}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />

            <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
              {discount > 0 && (
                <span className="rounded-full bg-cyan-600 px-3 py-1 text-xs font-bold text-white">
                  -{discount}% OFF
                </span>
              )}
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  inStock ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-700"
                }`}
              >
                {inStock ? "In Stock" : "Limited / Pre-order"}
              </span>
            </div>
          </div>

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {images.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-2xl border transition ${
                    activeImageIndex === index
                      ? "border-cyan-500 ring-2 ring-cyan-200"
                      : "border-cyan-100 hover:border-cyan-300"
                  }`}
                  aria-label={`Select product image ${index + 1}`}
                >
                  <Image src={img} alt={`${product.name} image ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </article>

        <article className="surface-card rounded-[1.75rem] p-5 sm:p-6 lg:sticky lg:top-28 lg:h-fit">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">
              {product.category || "Electronics"}
            </span>
            {product.brand && (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                {product.brand}
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            {product.name}
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            {product.description || "Premium-quality tech product with trusted support and delivery."}
          </p>

          <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
              <p className="font-display text-3xl font-bold text-cyan-800">{formatCurrency(price)}</p>
              {originalPrice && originalPrice > price && (
                <p className="text-lg font-medium text-slate-400 line-through">{formatCurrency(originalPrice)}</p>
              )}
            </div>
            {savings > 0 && (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                Save {formatCurrency(savings)} today
              </p>
            )}
            <p className="mt-2 text-sm font-medium text-slate-700">
              {inStock ? `${stockQty} units available now` : "Please contact us for availability"}
            </p>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {keyHighlights.map((item) => (
              <p key={item} className="inline-flex items-center gap-2 rounded-xl border border-cyan-100 bg-white px-3 py-2 text-sm text-slate-700">
                <Check size={16} className="text-emerald-600" />
                {item}
              </p>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-cyan-100 bg-white p-1">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-10 text-center text-base font-semibold text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-600 to-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:brightness-105"
            >
              <ShoppingCart size={18} />
              Add to cart
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="inline-flex items-center justify-center rounded-full border border-cyan-200 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
            >
              Buy now
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
            >
              <Share2 size={16} /> Share
            </button>

            <button
              type="button"
              onClick={handleWhatsAppOrderClick}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              <MessageCircle size={16} /> Order via WhatsApp
            </button>

            <a
              href="tel:+94766609143"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              <PhoneCall size={16} /> Call to order
            </a>
          </div>
        </article>
      </section>

      <section className="mt-7 surface-card rounded-[1.75rem] p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap gap-2 border-b border-cyan-100 pb-4">
          {[
            { id: "overview", label: "Overview" },
            { id: "specs", label: "Specifications" },
            { id: "shipping", label: "Shipping & Returns" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as "overview" | "specs" | "shipping")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-cyan-600 text-white"
                  : "border border-cyan-100 bg-white text-slate-600 hover:border-cyan-200 hover:text-cyan-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Brand", value: product.brand || "Siyatha Select" },
              { label: "Category", value: product.category || "Electronics" },
              { label: "SKU", value: product.sku || "Not available" },
              { label: "Warranty", value: product.warrantyPeriod || "Warranty included" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-cyan-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "specs" && (
          <div>
            {specEntries.length === 0 ? (
              <p className="rounded-2xl border border-cyan-100 bg-white p-4 text-sm text-slate-600">
                Detailed technical specifications will be updated soon for this product.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {specEntries.map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-cyan-100 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">{key}</p>
                    <p className="mt-1 text-sm text-slate-700">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-cyan-100 bg-white p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Truck size={16} className="text-cyan-700" /> Island-wide delivery
              </p>
              <p className="mt-2 text-sm text-slate-600">Photo prints ship within one business day. The cart shows when delivery becomes free.</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-white p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ShieldCheck size={16} className="text-cyan-700" /> Warranty support
              </p>
              <p className="mt-2 text-sm text-slate-600">Contact support for warranty claims with invoice and product serial details.</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-white p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <BadgeCheck size={16} className="text-cyan-700" /> Returns
              </p>
              <p className="mt-2 text-sm text-slate-600">Unused items can be returned within 7 days according to store policy.</p>
            </div>
          </div>
        )}
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-7 surface-card rounded-[1.75rem] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-slate-900">Related picks</h2>
            <Link href="/shop" className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.slice(0, 4).map((item) => {
              const relatedPrice = Number(item.onlinePrice ?? item.posPrice ?? 0);
              const relatedImage =
                Array.isArray(item.images) && item.images.length > 0
                  ? item.images[0]
                  : "https://placehold.co/600x500?text=No+Image";

              return (
                <Link
                  key={item._id}
                  href={`/shop/${item._id}`}
                  className="group overflow-hidden rounded-2xl border border-cyan-100 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                    <Image src={relatedImage} alt={item.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-700">
                    {item.category || "Product"}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{item.name}</h3>
                  <p className="mt-2 font-display text-xl font-bold text-cyan-800">{formatCurrency(relatedPrice)}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="surface-card rounded-2xl p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Package size={16} className="text-cyan-700" /> Quality packed
          </p>
          <p className="mt-2 text-sm text-slate-600">Secure packaging for safe transit across Sri Lanka.</p>
        </div>
        <div className="surface-card rounded-2xl p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Boxes size={16} className="text-cyan-700" /> Reliable inventory
          </p>
          <p className="mt-2 text-sm text-slate-600">Live stock visibility with direct checkout and order updates.</p>
        </div>
        <div className="surface-card rounded-2xl p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <BadgeCheck size={16} className="text-cyan-700" /> Trusted support
          </p>
          <p className="mt-2 text-sm text-slate-600">Dedicated assistance for order, dispatch, and warranty care.</p>
        </div>
      </section>

      {showWhatsAppPopup && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-cyan-100 bg-white p-6 shadow-2xl">
            <h3 className="font-display text-2xl font-bold text-slate-900">Complete Order Details</h3>
            <p className="mt-2 text-sm text-slate-600">
              Product details are auto-filled. Please add missing customer details before we open WhatsApp.
            </p>

            <form onSubmit={handleWhatsAppPopupSubmit} className="mt-5 space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                Name *
                <input
                  value={customerInfo.name}
                  onChange={(event) =>
                    setCustomerInfo((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Phone *
                <input
                  value={customerInfo.phone}
                  onChange={(event) =>
                    setCustomerInfo((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                City *
                <input
                  value={customerInfo.city}
                  onChange={(event) =>
                    setCustomerInfo((prev) => ({ ...prev, city: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Address (optional)
                <textarea
                  value={customerInfo.address}
                  onChange={(event) =>
                    setCustomerInfo((prev) => ({ ...prev, address: event.target.value }))
                  }
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWhatsAppPopup(false)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <MessageCircle size={15} /> Continue to WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
