"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { departments, inferDepartment, productMatchesDepartment, type DepartmentId } from "@/lib/storefront";
import {
  ArrowRight,
  Crown,
  Filter,
  Grid3X3,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  Wallet,
} from "lucide-react";

type Product = {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  onlinePrice?: number;
  posPrice?: number;
  sku?: string;
  category?: string;
  brand?: string;
  stockQty?: number;
};

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";
type PriceBucket = "all" | "under-500" | "500-2000" | "2000-8000" | "above-8000";
type ValueLevel = "all" | "best-value" | "premium" | "best-products";
type DeptKey = "all" | DepartmentId;

interface ShopClientProps {
  products: Product[];
  initialCategory?: string;
  initialQuery?: string;
  initialLevel?: ValueLevel;
  initialDept?: DeptKey | "online-stores";
}

const DEPARTMENT_OPTIONS: Array<{
  key: DepartmentId;
  title: string;
  subtitle: string;
  image: string;
  tags: string[];
}> = [
  {
    key: "packaging",
    title: departments.packaging.title,
    subtitle: departments.packaging.eyebrow,
    image: departments.packaging.image,
    tags: departments.packaging.categories.slice(0, 3).map((category) => category.title),
  },
  {
    key: "craft",
    title: departments.craft.title,
    subtitle: departments.craft.eyebrow,
    image: departments.craft.image,
    tags: departments.craft.categories.slice(0, 3).map((category) => category.title),
  },
];

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const PRICE_BUCKETS: Array<{ value: PriceBucket; label: string }> = [
  { value: "all", label: "All Prices" },
  { value: "under-500", label: "Under Rs 500" },
  { value: "500-2000", label: "Rs 500 - 2,000" },
  { value: "2000-8000", label: "Rs 2,000 - 8,000" },
  { value: "above-8000", label: "Above Rs 8,000" },
];

const VALUE_LEVEL_OPTIONS: Array<{
  value: ValueLevel;
  label: string;
  description: string;
  icon: typeof Wallet;
}> = [
  {
    value: "all",
    label: "All Levels",
    description: "Every product",
    icon: Grid3X3,
  },
  {
    value: "best-value",
    label: "Best Value",
    description: "Smaller everyday prices",
    icon: Wallet,
  },
  {
    value: "premium",
    label: "Premium",
    description: "Larger packs and higher prices",
    icon: Crown,
  },
  {
    value: "best-products",
    label: "Studio picks",
    description: "Mid-range stock",
    icon: Star,
  },
];

const normalizeObjectId = (value: unknown): string => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value !== null && "$oid" in value) {
    const oid = (value as { $oid?: unknown }).$oid;
    return typeof oid === "string" ? oid : "";
  }

  return "";
};

const getProductPrice = (product: Product): number => {
  const raw = product.onlinePrice ?? product.posPrice ?? 0;
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : 0;
};

const matchesPriceBucket = (price: number, bucket: PriceBucket): boolean => {
  switch (bucket) {
    case "under-500":
      return price < 500;
    case "500-2000":
      return price >= 500 && price <= 2000;
    case "2000-8000":
      return price > 2000 && price <= 8000;
    case "above-8000":
      return price > 8000;
    default:
      return true;
  }
};

const matchesValueLevel = (price: number, valueLevel: ValueLevel): boolean => {
  switch (valueLevel) {
    case "best-value":
      return price > 0 && price <= 1500;
    case "premium":
      return price >= 8000;
    case "best-products":
      return price > 1500 && price < 8000;
    default:
      return true;
  }
};

const normalizeValueLevel = (value?: string): ValueLevel => {
  if (value === "best-value" || value === "premium" || value === "best-products") {
    return value;
  }
  return "all";
};

const normalizeDept = (value?: string): DeptKey => {
  if (value === "packaging" || value === "online-stores") {
    return "packaging";
  }

  if (value === "craft") {
    return "craft";
  }

  return "all";
};

const buildSearchSource = (product: Product): string => {
  return `${product.name} ${product.description || ""} ${product.category || ""} ${product.brand || ""} ${product.sku || ""}`.toLowerCase();
};

export default function ShopClient({
  products,
  initialCategory = "",
  initialQuery = "",
  initialLevel = "all",
  initialDept = "all",
}: ShopClientProps) {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [concept, setConcept] = useState<DeptKey>(normalizeDept(initialDept));
  const [legacyCategory, setLegacyCategory] = useState(initialCategory);
  const [sortOption, setSortOption] = useState<SortOption>("featured");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [priceBucket, setPriceBucket] = useState<PriceBucket>("all");
  const [valueLevel, setValueLevel] = useState<ValueLevel>(normalizeValueLevel(initialLevel));
  const [showCompactFilters, setShowCompactFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  const conceptCounts = useMemo(() => {
    return {
      all: products.length,
      packaging: products.filter((product) => productMatchesDepartment(product, "packaging")).length,
      craft: products.filter((product) => productMatchesDepartment(product, "craft")).length,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    const base = products.filter((product) => {
      const price = getProductPrice(product);
      const searchable = buildSearchSource(product);
      const matchesQuery = normalizedQuery.length === 0 || searchable.includes(normalizedQuery);
      const matchesConcept = concept === "all" ? true : productMatchesDepartment(product, concept);
      const matchesStock = onlyInStock ? (product.stockQty ?? 0) > 0 : true;
      const matchesPrice = matchesPriceBucket(price, priceBucket);
      const matchesLevel = matchesValueLevel(price, valueLevel);
      const matchesLegacyCategory = legacyCategory ? (product.category || "") === legacyCategory : true;

      return (
        matchesQuery &&
        matchesConcept &&
        matchesStock &&
        matchesPrice &&
        matchesLevel &&
        matchesLegacyCategory
      );
    });

    const sorted = [...base];

    if (sortOption === "price-asc") {
      sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    } else if (sortOption === "price-desc") {
      sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    } else if (sortOption === "newest") {
      sorted.sort((a, b) => normalizeObjectId(b._id).localeCompare(normalizeObjectId(a._id)));
    }

    return sorted;
  }, [concept, legacyCategory, onlyInStock, priceBucket, products, searchTerm, sortOption, valueLevel]);

  useEffect(() => {
    const params = new URLSearchParams();

    const trimmed = searchTerm.trim();
    if (trimmed) {
      params.set("q", trimmed);
    }

    if (concept !== "all") {
      params.set("dept", concept);
    }

    if (valueLevel !== "all") {
      params.set("level", valueLevel);
    }

    if (legacyCategory) {
      params.set("category", legacyCategory);
    }

    const query = params.toString();
    router.replace(query ? `/shop?${query}` : "/shop", { scroll: false });
  }, [concept, legacyCategory, router, searchTerm, valueLevel]);

  useEffect(() => {
    setVisibleCount(12);
  }, [searchTerm, concept, sortOption, onlyInStock, priceBucket, valueLevel]);

  const hasActiveFilters =
    concept !== "all" ||
    searchTerm.trim().length > 0 ||
    onlyInStock ||
    priceBucket !== "all" ||
    valueLevel !== "all" ||
    legacyCategory.length > 0;

  const clearFilters = () => {
    setSearchTerm("");
    setConcept("all");
    setLegacyCategory("");
    setSortOption("featured");
    setOnlyInStock(false);
    setPriceBucket("all");
    setValueLevel("all");
    setShowCompactFilters(false);
  };

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="space-y-8 pb-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-100 bg-[linear-gradient(120deg,#681878_0%,#B10C53_52%,#DE2684_100%)] p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-12 h-44 w-44 rounded-full bg-[#F9E094]/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-[#CD7DA2]/25 blur-2xl" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">
              <Sparkles size={14} /> Packaging and craft
            </p>
            <h1 className="mt-3 font-display text-3xl font-black leading-tight sm:text-4xl">
              Shop packaging and craft materials
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-cyan-100 sm:text-base">
              Mailers, boxes, and tape for online sellers. Paper, glue, sewing, and ribbon for making at home.{" "}
              <Link href="/photo-prints" className="font-semibold text-white underline">
                Photo prints are ordered here.
              </Link>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-white/25 bg-white/10 px-3 py-2">
              <p className="text-2xl font-black">{products.length}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-100">Products</p>
            </div>
            <div className="rounded-2xl border border-white/25 bg-white/10 px-3 py-2">
              <p className="text-2xl font-black">2</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-100">Departments</p>
            </div>
            <div className="rounded-2xl border border-white/25 bg-white/10 px-3 py-2">
              <p className="text-2xl font-black">3</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-100">Value Lanes</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="vibrant-chip inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
              Categories
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold text-slate-900 sm:text-3xl">Shop by department</h2>
          </div>
          <button
            onClick={() => setConcept("all")}
            className="hidden text-sm font-semibold text-cyan-700 hover:text-cyan-800 sm:inline"
          >
            Show all
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {DEPARTMENT_OPTIONS.map((option) => {
            const isActive = concept === option.key;
            const count = conceptCounts[option.key];

            return (
              <button
                key={option.key}
                onClick={() => setConcept(option.key)}
                className={`group overflow-hidden rounded-3xl border text-left transition ${
                  isActive
                    ? "border-cyan-300 bg-cyan-50 shadow-sm"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-sm"
                }`}
              >
                <div className="relative aspect-[4/3]">
                  <Image src={option.image} alt={option.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent" />
                  <div className="absolute left-3 top-3 rounded-full border border-white/40 bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    {count} items
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-bold text-slate-900">{option.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{option.subtitle}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {option.tags.slice(0, 3).map((tag) => (
                      <span key={`${option.key}-${tag}`} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="surface-card rounded-3xl p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.15fr_0.7fr_0.7fr_auto] lg:items-center">
          <label className="relative">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search product, SKU, brand..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>

          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value as SortOption)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setOnlyInStock((value) => !value)}
            className={`inline-flex h-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              onlyInStock
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <Tag size={15} /> {onlyInStock ? "In Stock" : "Any Stock"}
          </button>

          <button
            onClick={() => setShowCompactFilters((value) => !value)}
            className="inline-flex h-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            <SlidersHorizontal size={15} />
            {showCompactFilters ? "Hide" : "More"}
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="flex flex-wrap gap-2">
            {VALUE_LEVEL_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = valueLevel === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setValueLevel(option.value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.11em] transition ${
                    active
                      ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-cyan-200"
                  }`}
                  title={option.description}
                >
                  <Icon size={13} /> {option.label}
                </button>
              );
            })}
          </div>

          {showCompactFilters ? (
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {PRICE_BUCKETS.map((bucket) => {
                const active = priceBucket === bucket.value;
                return (
                  <button
                    key={bucket.value}
                    onClick={() => setPriceBucket(bucket.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.11em] transition ${
                      active
                        ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-cyan-200"
                    }`}
                  >
                    {bucket.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-end text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              <Filter size={13} className="mr-1.5" />
              Toggle more for price buckets
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-700">
            {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} found
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.11em] text-slate-600 hover:border-slate-300"
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      </section>

      {visibleProducts.length === 0 ? (
        <section className="surface-card rounded-3xl p-10 text-center">
          <ShoppingBag size={36} className="mx-auto text-slate-300" />
          <h3 className="mt-4 font-display text-2xl font-bold text-slate-900">No products match this setup</h3>
          <p className="mt-2 text-sm text-slate-600">
            Try the other department, or clear the search.
          </p>
          <button
            onClick={clearFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Reset Shop <ArrowRight size={15} />
          </button>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => {
            const productId = normalizeObjectId(product._id);
            if (!productId) {
              return null;
            }

            const price = getProductPrice(product);
            const imageUrl = product.images?.[0] || "https://placehold.co/700x520?text=No+Image";
            const isInStock = (product.stockQty ?? 0) > 0;
            const inferredConcept = inferDepartment(product);
            const conceptLabel = inferredConcept === "all" ? "Shop" : departments[inferredConcept].title;

            return (
              <article key={productId} className="surface-card group overflow-hidden rounded-3xl p-4">
                <Link href={`/shop/${productId}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-800">
                        {product.category || "General"}
                      </span>
                      <span className="rounded-full bg-[#B10C53]/90 px-2.5 py-1 text-[11px] font-semibold text-white">
                        {conceptLabel}
                      </span>
                    </div>
                    <span
                      className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        isInStock ? "bg-emerald-500/90 text-white" : "bg-slate-700/85 text-slate-100"
                      }`}
                    >
                      {isInStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </Link>

                <div className="mt-4">
                  <Link href={`/shop/${productId}`}>
                    <h3 className="line-clamp-2 font-display text-xl font-bold text-slate-900 transition group-hover:text-cyan-700">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.description || "No description available."}</p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-2xl font-black text-cyan-700">Rs {price.toLocaleString()}</p>
                    {product.brand ? (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                        {product.brand}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() =>
                        addToCart({
                          _id: productId,
                          name: product.name,
                          price,
                          image: imageUrl,
                        })
                      }
                      disabled={!isInStock}
                      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                        isInStock
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "cursor-not-allowed bg-slate-200 text-slate-500"
                      }`}
                    >
                      <ShoppingBag size={15} /> {isInStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                    <Link
                      href={`/shop/${productId}`}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {visibleCount < filteredProducts.length ? (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount((count) => count + 12)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
          >
            Load More <ArrowRight size={15} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
