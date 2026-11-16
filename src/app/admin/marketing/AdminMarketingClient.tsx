"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  Barcode,
  Megaphone,
  PackagePlus,
  Printer,
  RefreshCw,
  Route,
  ShoppingBag,
  Tag,
  Truck,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";

type TabKey = "posts" | "orders" | "inventory" | "sync" | "tracking";
type FontKey = "sinhala-sans" | "sinhala-serif" | "display-mix";
type PostType = "PRODUCT_POST" | "NOTICE" | "RANGE_COLLECTION";
type PostStatus = "DRAFT" | "PUBLISHED";

type CurrentUser = {
  id: string;
  role: string;
  name: string;
};

type ProductLite = {
  _id: string;
  name: string;
  sku?: string;
  category?: string;
  stockQty?: number;
  onlinePrice?: number;
  posPrice?: number;
};

type MarketingPost = {
  _id: string;
  type: PostType;
  status: PostStatus;
  titleSi: string;
  titleEn?: string;
  contentSi: string;
  contentEn?: string;
  noticeLevel?: "INFO" | "IMPORTANT" | "ALERT";
  rangeName?: string;
  productIds?: Array<{ _id: string; name: string }> | string[];
  tags?: string[];
  fontKey: FontKey;
  pinned?: boolean;
  createdAt: string;
};

type OrderRecord = {
  _id: string;
  orderNumber: string;
  customerName?: string;
  phone?: string;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  trackingNumber?: string;
  courierService?: string;
  createdAt: string;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    notes?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
};

type TrackingSummary = {
  summary: {
    days: number;
    totalEvents: number;
    totalUniqueVisitors: number;
  };
  topPages: Array<{ pageUrl: string; count: number }>;
  topEvents: Array<{ eventName: string; count: number }>;
  dailyTrend: Array<{ date: string; events: number; uniqueVisitors: number }>;
  recentEvents: Array<{
    _id: string;
    eventName: string;
    pageUrl: string;
    visitorId: string;
    userRole?: string;
    createdAt: string;
    utmCampaign?: string;
  }>;
};

const fontClassMap: Record<FontKey, string> = {
  "sinhala-sans": "font-sinhala-sans",
  "sinhala-serif": "font-sinhala-serif",
  "display-mix": "font-display-mix",
};

const initialPostForm = {
  type: "PRODUCT_POST" as PostType,
  status: "DRAFT" as PostStatus,
  titleSi: "",
  titleEn: "",
  contentSi: "",
  contentEn: "",
  noticeLevel: "INFO" as "INFO" | "IMPORTANT" | "ALERT",
  rangeName: "",
  fontKey: "sinhala-sans" as FontKey,
  tagsCsv: "",
  pinned: false,
  productIds: [] as string[],
};

const initialOrderForm = {
  customerName: "",
  phone: "",
  paymentMethod: "cash",
  firstName: "",
  lastName: "",
  email: "",
  shippingPhone: "",
  address: "",
  city: "Colombo",
  postalCode: "",
  notes: "",
};

const emptyTracking: TrackingSummary = {
  summary: {
    days: 30,
    totalEvents: 0,
    totalUniqueVisitors: 0,
  },
  topPages: [],
  topEvents: [],
  dailyTrend: [],
  recentEvents: [],
};

function normalizeTab(value: string | undefined): TabKey {
  if (
    value === "posts" ||
    value === "orders" ||
    value === "inventory" ||
    value === "sync" ||
    value === "tracking"
  ) {
    return value;
  }

  return "posts";
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function AdminMarketingClient({
  currentUser,
  initialTab,
}: {
  currentUser: CurrentUser;
  initialTab: TabKey;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = normalizeTab(searchParams.get("tab") ?? initialTab);

  const [products, setProducts] = useState<ProductLite[]>([]);
  const [posts, setPosts] = useState<MarketingPost[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [tracking, setTracking] = useState<TrackingSummary>(emptyTracking);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingTracking, setLoadingTracking] = useState(false);

  const [postForm, setPostForm] = useState(initialPostForm);
  const [orderForm, setOrderForm] = useState(initialOrderForm);
  const [orderLines, setOrderLines] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: "", quantity: 1 },
  ]);

  const [dispatchDrafts, setDispatchDrafts] = useState<
    Record<string, { status: string; trackingNumber: string; courierService: string }>
  >({});

  const [syncEndpoint, setSyncEndpoint] = useState("");
  const [syncApiKey, setSyncApiKey] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const [inventoryQuery, setInventoryQuery] = useState("");
  const [inventoryCategory, setInventoryCategory] = useState("all");
  const [inventoryOnlyLowStock, setInventoryOnlyLowStock] = useState(false);
  const [inventorySort, setInventorySort] = useState<
    "name-asc" | "stock-asc" | "stock-desc" | "price-asc" | "price-desc"
  >("stock-asc");

  const [submittingPost, setSubmittingPost] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [patchingPostId, setPatchingPostId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch("/api/admin/products?limit=250", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to load products");
      setProducts(Array.isArray(data?.products) ? data.products : []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const response = await fetch("/api/admin/marketing/posts?limit=150", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to load posts");
      setPosts(Array.isArray(data?.posts) ? data.posts : []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load marketing posts");
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch("/api/admin/orders?limit=140", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to load orders");
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const loadTracking = useCallback(async () => {
    setLoadingTracking(true);
    try {
      const response = await fetch("/api/admin/tracking?days=30", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to load tracking");
      setTracking(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load tracking data");
    } finally {
      setLoadingTracking(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadProducts(), loadPosts(), loadOrders(), loadTracking()]);
  }, [loadOrders, loadPosts, loadProducts, loadTracking]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const navigateToTab = useCallback(
    (nextTab: TabKey) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set("tab", nextTab);
      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    if (orders.length === 0) return;

    const nextDrafts: Record<string, { status: string; trackingNumber: string; courierService: string }> = {};
    for (const order of orders) {
      nextDrafts[order._id] = {
        status: order.status,
        trackingNumber: order.trackingNumber || "",
        courierService: order.courierService || "",
      };
    }
    setDispatchDrafts(nextDrafts);
  }, [orders]);

  const postPreviewClass = useMemo(() => fontClassMap[postForm.fontKey], [postForm.fontKey]);

  const handleCreatePost = async () => {
    if (!postForm.titleSi.trim() || !postForm.contentSi.trim()) {
      toast.error("සිංහල title සහ content අවශ්‍යයි");
      return;
    }

    setSubmittingPost(true);
    try {
      const response = await fetch("/api/admin/marketing/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...postForm,
          tags: postForm.tagsCsv
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to create post");

      toast.success("Marketing post එක සාර්ථකව සකස් කළා");
      setPostForm(initialPostForm);
      await loadPosts();
    } catch (error: any) {
      toast.error(error.message || "Post create failed");
    } finally {
      setSubmittingPost(false);
    }
  };

  const patchPost = async (postId: string, payload: Record<string, unknown>) => {
    const response = await fetch(`/api/admin/marketing/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || "Failed to update post");
  };

  const handleTogglePostStatus = async (post: MarketingPost) => {
    setPatchingPostId(post._id);
    try {
      await patchPost(post._id, {
        status: post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
      });
      await loadPosts();
      toast.success(post.status === "PUBLISHED" ? "Moved to draft" : "Post published");
    } catch (error: any) {
      toast.error(error.message || "Failed to update post status");
    } finally {
      setPatchingPostId(null);
    }
  };

  const handleTogglePostPinned = async (post: MarketingPost) => {
    setPatchingPostId(post._id);
    try {
      await patchPost(post._id, { pinned: !post.pinned });
      await loadPosts();
      toast.success(post.pinned ? "Post unpinned" : "Post pinned");
    } catch (error: any) {
      toast.error(error.message || "Failed to update pin status");
    } finally {
      setPatchingPostId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("මෙම post එක ඉවත් කරන්නද?")) return;

    try {
      const response = await fetch(`/api/admin/marketing/posts/${postId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to delete post");
      toast.success("Post එක ඉවත් කළා");
      await loadPosts();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const handleAddOrderLine = () => {
    setOrderLines((prev) => [...prev, { productId: "", quantity: 1 }]);
  };

  const handleUpdateOrderLine = (index: number, patch: Partial<{ productId: string; quantity: number }>) => {
    setOrderLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const handleRemoveOrderLine = (index: number) => {
    setOrderLines((prev) => {
      if (prev.length <= 1) {
        return [{ productId: "", quantity: 1 }];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const selectedProductMap = useMemo(() => {
    return new Map(products.map((product) => [product._id, product]));
  }, [products]);

  const orderEstimate = useMemo(() => {
    return orderLines.reduce((sum, line) => {
      const product = selectedProductMap.get(line.productId);
      if (!product) return sum;
      const unit = Number(product.onlinePrice || product.posPrice || 0);
      return sum + unit * Math.max(1, Number(line.quantity || 1));
    }, 0);
  }, [orderLines, selectedProductMap]);

  const hasOverStockItems = useMemo(() => {
    return orderLines.some((line) => {
      if (!line.productId) return false;
      const product = selectedProductMap.get(line.productId);
      if (!product) return false;
      const available = Number(product.stockQty || 0);
      return Math.max(1, Number(line.quantity || 1)) > available;
    });
  }, [orderLines, selectedProductMap]);

  const inventoryCategories = useMemo(() => {
    const categories = new Set<string>();
    for (const product of products) {
      const category = String(product.category || "").trim();
      if (category) categories.add(category);
    }
    return ["all", ...Array.from(categories).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const visibleInventory = useMemo(() => {
    const query = inventoryQuery.trim().toLowerCase();

    const filtered = products.filter((product) => {
      if (inventoryCategory !== "all" && product.category !== inventoryCategory) {
        return false;
      }

      const stockQty = Number(product.stockQty || 0);
      if (inventoryOnlyLowStock && stockQty > 5) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        product.name,
        product.sku || "",
        product.category || "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const stockA = Number(a.stockQty || 0);
      const stockB = Number(b.stockQty || 0);
      const priceA = Number(a.onlinePrice || a.posPrice || 0);
      const priceB = Number(b.onlinePrice || b.posPrice || 0);

      if (inventorySort === "name-asc") return a.name.localeCompare(b.name);
      if (inventorySort === "stock-asc") return stockA - stockB;
      if (inventorySort === "stock-desc") return stockB - stockA;
      if (inventorySort === "price-asc") return priceA - priceB;
      return priceB - priceA;
    });

    return sorted;
  }, [inventoryCategory, inventoryOnlyLowStock, inventoryQuery, inventorySort, products]);

  const handleCreateOrder = async () => {
    const filteredItems = orderLines.filter((line) => line.productId);
    if (filteredItems.length === 0) {
      toast.error("Order items එකක් හෝ තෝරන්න");
      return;
    }

    const customerName = orderForm.customerName.trim();
    const phone = orderForm.phone.trim();
    const address = orderForm.address.trim();

    if (!customerName) {
      toast.error("Customer name අවශ්‍යයි");
      return;
    }

    if (!phone) {
      toast.error("Phone number අවශ්‍යයි");
      return;
    }

    if (!address) {
      toast.error("Address අවශ්‍යයි");
      return;
    }

    if (hasOverStockItems) {
      toast.error("Selected quantity exceeds available stock");
      return;
    }

    const mergedItemsMap = new Map<string, number>();
    for (const line of filteredItems) {
      const existingQty = mergedItemsMap.get(line.productId) || 0;
      mergedItemsMap.set(line.productId, existingQty + Math.max(1, Number(line.quantity || 1)));
    }

    const mergedItems = Array.from(mergedItemsMap.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    setSubmittingOrder(true);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          paymentMethod: orderForm.paymentMethod,
          shippingAddress: {
            firstName: orderForm.firstName.trim(),
            lastName: orderForm.lastName.trim(),
            email: orderForm.email.trim(),
            phone: orderForm.shippingPhone.trim() || phone,
            address,
            city: orderForm.city.trim() || "Colombo",
            postalCode: orderForm.postalCode.trim(),
            notes: orderForm.notes.trim(),
          },
          items: mergedItems,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to create order");

      toast.success("Manual order එක සාර්ථකයි");
      setOrderForm(initialOrderForm);
      setOrderLines([{ productId: "", quantity: 1 }]);
      await Promise.all([loadOrders(), loadProducts(), loadTracking()]);
    } catch (error: any) {
      toast.error(error.message || "Order create failed");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleUpdateDispatch = async (orderId: string) => {
    const draft = dispatchDrafts[orderId];
    if (!draft) return;

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to update dispatch");

      toast.success("Dispatch update saved");
      await Promise.all([loadOrders(), loadTracking()]);
    } catch (error: any) {
      toast.error(error.message || "Dispatch update failed");
    }
  };

  const renderBarcodePrint = (order: OrderRecord, includeLabel: boolean) => {
    const shipping = order.shippingAddress;
    const title = includeLabel ? "Dispatch Label" : "Order Barcode";

    const html = `
      <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
          .card { border: 1px solid #d1d5db; border-radius: 12px; padding: 20px; max-width: 520px; }
          .k { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
          .v { font-size: 18px; font-weight: bold; margin: 3px 0 12px; }
          .address { margin-top: 10px; padding: 10px; background: #f9fafb; border-radius: 8px; }
          .meta { margin-bottom: 10px; }
          .barcode { margin: 14px 0 6px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="meta">
            <div class="k">Order Number</div>
            <div class="v">${escapeHtml(order.orderNumber)}</div>
          </div>
          <div class="meta">
            <div class="k">Customer</div>
            <div>${escapeHtml(order.customerName || "N/A")} (${escapeHtml(order.phone || "N/A")})</div>
          </div>
          <div class="meta">
            <div class="k">Status</div>
            <div>${escapeHtml(order.status)}</div>
          </div>
          <div class="barcode">
            <svg id="barcode"></svg>
          </div>
          ${
            includeLabel
              ? `<div class="address">
                  <div class="k">Shipping Address</div>
                  <div>${escapeHtml(
                    `${shipping?.firstName || ""} ${shipping?.lastName || ""}`.trim() || "N/A"
                  )}</div>
                  <div>${escapeHtml(shipping?.address || "N/A")}</div>
                  <div>${escapeHtml(shipping?.city || "")} ${escapeHtml(shipping?.postalCode || "")}</div>
                  <div>${escapeHtml(shipping?.phone || order.phone || "N/A")}</div>
                </div>`
              : ""
          }
        </div>

        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
        <script>
          JsBarcode("#barcode", "${escapeHtml(order.orderNumber)}", {
            format: "CODE128",
            width: 2,
            height: 64,
            displayValue: true,
            fontSize: 14,
            margin: 4
          });
          setTimeout(() => { window.print(); }, 250);
        <\/script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=800,height=720");
    if (!printWindow) {
      toast.error("Print window blocked. Please allow popups.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleSyncFromCloudPos = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/admin/inventory/sync-cloud-pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpointUrl: syncEndpoint || undefined,
          apiKey: syncApiKey || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Sync failed");

      setSyncResult(data);
      toast.success("Cloud POS sync completed");
      await Promise.all([loadProducts(), loadTracking()]);
    } catch (error: any) {
      toast.error(error.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleGenerateJPEG = useCallback(async () => {
    const previewElement = document.getElementById("post-preview");
    if (!previewElement) {
      toast.error("Preview not found");
      return;
    }

    try {
      const canvas = await html2canvas(previewElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `marketing-post-${Date.now()}.jpeg`;
      link.href = canvas.toDataURL("image/jpeg", 0.9);
      link.click();

      toast.success("JPEG generated and downloaded");
    } catch (error) {
      console.error("JPEG generation failed:", error);
      toast.error("Failed to generate JPEG");
    }
  }, []);

  return (
    <>
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 p-6 text-white shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em]">Admin Marketing Ops</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          සිංහල Marketing, Orders, Dispatch & Inventory Sync
        </h1>
        <p className="mt-2 text-sm text-blue-50 sm:text-base">
          Products marketing posts, notices, range collections, order dispatch, barcode/label printing, and Cloud POS item sync in one admin workspace.
        </p>
        <p className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
          Logged as: {currentUser.name} ({currentUser.role})
        </p>
      </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {[
            { key: "posts", label: "Marketing Posts", icon: Megaphone },
            { key: "orders", label: "Orders & Dispatch", icon: Truck },
            { key: "inventory", label: "Inventory View", icon: PackagePlus },
            { key: "sync", label: "Cloud POS Sync", icon: Route },
            { key: "tracking", label: "User Tracking", icon: Activity },
          ].map((tab) => {
            const active = activeTab === (tab.key as TabKey);
            return (
              <button
                key={tab.key}
                type="button"
                  onClick={() => navigateToTab(tab.key as TabKey)}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-cyan-300 bg-cyan-100 text-cyan-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50"
                }`}
              >
                <tab.icon size={20} />
                <p className="mt-2 text-sm font-semibold">{tab.label}</p>
              </button>
            );
          })}
        </div>

        <div className="mb-5 flex justify-end">
          <button
            type="button"
            onClick={() => void refreshAll()}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
          >
            <RefreshCw size={16} /> Reload Data
          </button>
        </div>

        {activeTab === "posts" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_1fr]">
            <section className="surface-card rounded-3xl p-6">
              <h2 className="font-display text-2xl font-bold text-slate-900">Marketing Post Creator (සිංහල)</h2>
              <p className="mt-1 text-sm text-slate-600">
                Product post, notice, range collection post types with Sinhala-first content and font selection.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  Post Type
                  <select
                    value={postForm.type}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, type: e.target.value as PostType }))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  >
                    <option value="PRODUCT_POST">Product Post</option>
                    <option value="NOTICE">Notice</option>
                    <option value="RANGE_COLLECTION">Range Collection</option>
                  </select>
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Status
                  <select
                    value={postForm.status}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, status: e.target.value as PostStatus }))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </label>

                <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                  සිංහල Title
                  <input
                    value={postForm.titleSi}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, titleSi: e.target.value }))}
                    placeholder="උදා: අලුත් Power Bank collection එක දැන් ලැබුණා"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                  English Title (optional)
                  <input
                    value={postForm.titleEn}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, titleEn: e.target.value }))}
                    placeholder="Optional English title"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                  සිංහල Content
                  <textarea
                    value={postForm.contentSi}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, contentSi: e.target.value }))}
                    rows={4}
                    placeholder="විස්තර මෙතැන දමන්න..."
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                  English Content (optional)
                  <textarea
                    value={postForm.contentEn}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, contentEn: e.target.value }))}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>

                {postForm.type === "NOTICE" && (
                  <label className="text-sm font-semibold text-slate-700">
                    Notice Level
                    <select
                      value={postForm.noticeLevel}
                      onChange={(e) =>
                        setPostForm((prev) => ({
                          ...prev,
                          noticeLevel: e.target.value as "INFO" | "IMPORTANT" | "ALERT",
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                    >
                      <option value="INFO">Info</option>
                      <option value="IMPORTANT">Important</option>
                      <option value="ALERT">Alert</option>
                    </select>
                  </label>
                )}

                {postForm.type === "RANGE_COLLECTION" && (
                  <label className="text-sm font-semibold text-slate-700">
                    Collection / Range Name
                    <input
                      value={postForm.rangeName}
                      onChange={(e) => setPostForm((prev) => ({ ...prev, rangeName: e.target.value }))}
                      placeholder="Power Range 5K - 30K"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </label>
                )}

                <label className="text-sm font-semibold text-slate-700">
                  Font Style
                  <select
                    value={postForm.fontKey}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, fontKey: e.target.value as FontKey }))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  >
                    <option value="sinhala-sans">Sinhala Sans</option>
                    <option value="sinhala-serif">Sinhala Serif</option>
                    <option value="display-mix">Display Mix</option>
                  </select>
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Tags (comma separated)
                  <input
                    value={postForm.tagsCsv}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, tagsCsv: e.target.value }))}
                    placeholder="powerbank, notice, delivery"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                  Product Links (multi-select)
                  <select
                    multiple
                    value={postForm.productIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                      setPostForm((prev) => ({ ...prev, productIds: selected }));
                    }}
                    className="mt-1 h-36 w-full rounded-xl border border-slate-300 px-3 py-2"
                  >
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} ({product.sku || "NO-SKU"})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={postForm.pinned}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, pinned: e.target.checked }))}
                  />
                  Pin this post
                </label>
              </div>

              <div id="post-preview" className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">Preview</p>
                <h3 className={`mt-2 text-xl font-bold text-slate-900 ${postPreviewClass}`}>
                  {postForm.titleSi || "සිංහල Marketing Preview"}
                </h3>
                <p className={`mt-2 text-sm leading-7 text-slate-700 ${postPreviewClass}`}>
                  {postForm.contentSi || "ඔබගේ post content එක මෙතැනින් preview කරන්න."}
                </p>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  disabled={submittingPost}
                  onClick={() => void handleCreatePost()}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <Megaphone size={16} /> {submittingPost ? "Saving..." : "Create Marketing Post"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleGenerateJPEG()}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-white px-5 py-2.5 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
                >
                  <Printer size={16} /> Generate JPEG
                </button>
              </div>
            </section>

            <section className="surface-card rounded-3xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-slate-900">Created Posts</h2>
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                  {loadingPosts ? "Loading..." : `${posts.length} posts`}
                </span>
              </div>

              <div className="max-h-[780px] space-y-4 overflow-auto pr-1">
                {posts.map((post) => {
                  const fontClass = fontClassMap[post.fontKey] || "font-sinhala-sans";
                  const linkedProducts = Array.isArray(post.productIds) ? post.productIds : [];

                  return (
                    <article key={post._id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{post.type}</span>
                        <span
                          className={`rounded-full px-2.5 py-1 ${
                            post.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {post.status}
                        </span>
                        {post.pinned && (
                          <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-cyan-700">Pinned</span>
                        )}
                      </div>

                      <h3 className={`text-lg font-bold text-slate-900 ${fontClass}`}>{post.titleSi}</h3>
                      <p className={`mt-2 text-sm leading-7 text-slate-700 ${fontClass}`}>{post.contentSi}</p>

                      {post.type === "RANGE_COLLECTION" && post.rangeName && (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">
                          Range: {post.rangeName}
                        </p>
                      )}

                      {linkedProducts.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {linkedProducts.map((product: any) => (
                            <span
                              key={typeof product === "string" ? product : product._id}
                              className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs text-cyan-700"
                            >
                              {typeof product === "string" ? product : product.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={patchingPostId === post._id}
                          onClick={() => void handleTogglePostStatus(post)}
                          className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {post.status === "PUBLISHED" ? "Move to Draft" : "Publish"}
                        </button>
                        <button
                          type="button"
                          disabled={patchingPostId === post._id}
                          onClick={() => void handleTogglePostPinned(post)}
                          className="rounded-full border border-cyan-300 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-50"
                        >
                          {post.pinned ? "Unpin" : "Pin"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeletePost(post._id)}
                          className="rounded-full border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}

                {!loadingPosts && posts.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50 p-6 text-center text-sm text-slate-700">
                    No marketing posts found yet.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="grid gap-6 xl:grid-cols-[1.02fr_1fr]">
            <section className="surface-card rounded-3xl p-6">
              <h2 className="font-display text-2xl font-bold text-slate-900">New Order Placement</h2>
              <p className="mt-1 text-sm text-slate-600">
                Create manual orders for phone/marketing customers and auto-update product inventory.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  Customer Name
                  <input
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm((prev) => ({ ...prev, customerName: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Phone
                  <input
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Payment Method
                  <select
                    value={orderForm.paymentMethod}
                    onChange={(e) => setOrderForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                  </select>
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  City
                  <input
                    value={orderForm.city}
                    onChange={(e) => setOrderForm((prev) => ({ ...prev, city: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                  Address
                  <textarea
                    value={orderForm.address}
                    onChange={(e) => setOrderForm((prev) => ({ ...prev, address: e.target.value }))}
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Order Items</h3>
                  <button
                    type="button"
                    onClick={handleAddOrderLine}
                    className="rounded-full border border-cyan-300 px-3 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {orderLines.map((line, index) => {
                    const selected = selectedProductMap.get(line.productId);
                    const unit = Number(selected?.onlinePrice || selected?.posPrice || 0);
                    const subtotal = unit * Math.max(1, Number(line.quantity || 1));
                    const available = Number(selected?.stockQty || 0);
                    const overStock = Boolean(selected && Math.max(1, Number(line.quantity || 1)) > available);

                    return (
                      <div key={`${index}-${line.productId}`} className="rounded-xl border border-slate-200 p-3">
                        <div className="grid gap-3 sm:grid-cols-[1fr_110px_auto]">
                          <select
                            value={line.productId}
                            onChange={(e) =>
                              handleUpdateOrderLine(index, {
                                productId: e.target.value,
                              })
                            }
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                              <option key={product._id} value={product._id}>
                                {product.name} (Stock: {product.stockQty || 0})
                              </option>
                            ))}
                          </select>

                          <input
                            type="number"
                            min={1}
                            value={line.quantity}
                            onChange={(e) =>
                              handleUpdateOrderLine(index, {
                                quantity: Math.max(1, Number(e.target.value || 1)),
                              })
                            }
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveOrderLine(index)}
                            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Remove
                          </button>
                        </div>

                        {selected && (
                          <p className="mt-2 text-xs text-slate-600">
                            {selected.sku || "NO-SKU"} | Unit: Rs {unit.toLocaleString()} | Subtotal: Rs {subtotal.toLocaleString()}
                          </p>
                        )}

                        {overStock && (
                          <p className="mt-1 text-xs font-semibold text-rose-600">
                            Quantity exceeds stock ({available}). Please reduce quantity.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="mt-4 rounded-xl bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800">
                  Estimated Total: Rs {orderEstimate.toLocaleString()}
                </p>

                {hasOverStockItems && (
                  <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                    Some items exceed current stock. Please adjust before creating order.
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={submittingOrder || hasOverStockItems}
                onClick={() => void handleCreateOrder()}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                <ShoppingBag size={16} /> {submittingOrder ? "Creating..." : "Create Order"}
              </button>
            </section>

            <section className="surface-card rounded-3xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-slate-900">Order Details & Dispatch</h2>
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                  {loadingOrders ? "Loading..." : `${orders.length} orders`}
                </span>
              </div>

              <div className="max-h-[780px] space-y-4 overflow-auto pr-1">
                {orders.map((order) => {
                  const draft = dispatchDrafts[order._id] || {
                    status: order.status,
                    trackingNumber: order.trackingNumber || "",
                    courierService: order.courierService || "",
                  };
                  const hasDispatchChanges =
                    draft.status !== order.status ||
                    draft.trackingNumber !== (order.trackingNumber || "") ||
                    draft.courierService !== (order.courierService || "");

                  return (
                    <article key={order._id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{order.orderNumber}</h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {order.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-700">
                        {order.customerName || "N/A"} | {order.phone || "N/A"}
                      </p>
                      <p className="text-sm font-semibold text-cyan-700">Rs {order.totalAmount.toLocaleString()}</p>

                      <div className="mt-2 text-xs text-slate-600">
                        {order.items.slice(0, 3).map((item) => (
                          <p key={`${order._id}-${item.name}`}>• {item.name} x {item.quantity}</p>
                        ))}
                        {order.items.length > 3 && <p>+ {order.items.length - 3} more items</p>}
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <select
                          value={draft.status}
                          onChange={(e) =>
                            setDispatchDrafts((prev) => ({
                              ...prev,
                              [order._id]: { ...draft, status: e.target.value },
                            }))
                          }
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs"
                        >
                          <option value="pending">pending</option>
                          <option value="processing">processing</option>
                          <option value="shipped">shipped</option>
                          <option value="delivered">delivered</option>
                          <option value="cancelled">cancelled</option>
                        </select>

                        <input
                          value={draft.trackingNumber}
                          onChange={(e) =>
                            setDispatchDrafts((prev) => ({
                              ...prev,
                              [order._id]: { ...draft, trackingNumber: e.target.value },
                            }))
                          }
                          placeholder="Tracking #"
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs"
                        />

                        <input
                          value={draft.courierService}
                          onChange={(e) =>
                            setDispatchDrafts((prev) => ({
                              ...prev,
                              [order._id]: { ...draft, courierService: e.target.value },
                            }))
                          }
                          placeholder="Courier"
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={!hasDispatchChanges}
                          onClick={() => void handleUpdateDispatch(order._id)}
                          className="rounded-full border border-cyan-300 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Save Dispatch Update
                        </button>
                        <button
                          type="button"
                          onClick={() => renderBarcodePrint(order, false)}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Barcode size={12} /> Print Barcode
                        </button>
                        <button
                          type="button"
                          onClick={() => renderBarcodePrint(order, true)}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Printer size={12} /> Print Label
                        </button>
                      </div>
                    </article>
                  );
                })}

                {!loadingOrders && orders.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50 p-6 text-center text-sm text-slate-700">
                    No orders found.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="surface-card rounded-3xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Total Products</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{products.length}</p>
              </div>
              <div className="surface-card rounded-3xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Low Stock (&lt;=5)</p>
                <p className="mt-2 text-3xl font-bold text-amber-600">
                  {products.filter((product) => Number(product.stockQty || 0) <= 5).length}
                </p>
              </div>
              <div className="surface-card rounded-3xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Out of Stock</p>
                <p className="mt-2 text-3xl font-bold text-rose-600">
                  {products.filter((product) => Number(product.stockQty || 0) === 0).length}
                </p>
              </div>
            </section>

            <section className="surface-card rounded-3xl p-6">
              <div className="grid gap-3 lg:grid-cols-[1.3fr_0.9fr_0.9fr_auto]">
                <input
                  value={inventoryQuery}
                  onChange={(e) => setInventoryQuery(e.target.value)}
                  placeholder="Search by name, SKU, or category"
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />

                <select
                  value={inventoryCategory}
                  onChange={(e) => setInventoryCategory(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                >
                  {inventoryCategories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>

                <select
                  value={inventorySort}
                  onChange={(e) =>
                    setInventorySort(
                      e.target.value as "name-asc" | "stock-asc" | "stock-desc" | "price-asc" | "price-desc"
                    )
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="stock-asc">Stock: Low to High</option>
                  <option value="stock-desc">Stock: High to Low</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>

                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={inventoryOnlyLowStock}
                    onChange={(e) => setInventoryOnlyLowStock(e.target.checked)}
                  />
                  Low stock only
                </label>
              </div>
            </section>

            <section className="surface-card rounded-3xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-slate-900">Inventory List</h2>
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                  {loadingProducts ? "Loading..." : `${visibleInventory.length} products`}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="px-2 py-2 font-semibold">Product</th>
                      <th className="px-2 py-2 font-semibold">SKU</th>
                      <th className="px-2 py-2 font-semibold">Category</th>
                      <th className="px-2 py-2 font-semibold">Stock</th>
                      <th className="px-2 py-2 font-semibold">Online Price</th>
                      <th className="px-2 py-2 font-semibold">POS Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleInventory.map((product) => {
                      const stockQty = Number(product.stockQty || 0);
                      const stockClass =
                        stockQty === 0
                          ? "text-rose-700"
                          : stockQty <= 5
                            ? "text-amber-700"
                            : "text-emerald-700";

                      return (
                        <tr key={product._id} className="border-b border-slate-100">
                          <td className="px-2 py-2 font-medium text-slate-900">{product.name}</td>
                          <td className="px-2 py-2 text-slate-600">{product.sku || "NO-SKU"}</td>
                          <td className="px-2 py-2 text-slate-600">{product.category || "-"}</td>
                          <td className={`px-2 py-2 font-semibold ${stockClass}`}>{stockQty}</td>
                          <td className="px-2 py-2 text-slate-600">
                            Rs {Number(product.onlinePrice || 0).toLocaleString()}
                          </td>
                          <td className="px-2 py-2 text-slate-600">
                            Rs {Number(product.posPrice || 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {!loadingProducts && visibleInventory.length === 0 && (
                <p className="mt-4 text-sm text-slate-600">No products match current filters.</p>
              )}
            </section>
          </div>
        )}

        {activeTab === "sync" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="surface-card rounded-3xl p-6">
              <h2 className="font-display text-2xl font-bold text-slate-900">Cloud POS → Siyatha Inventory Sync</h2>
              <p className="mt-1 text-sm text-slate-600">
                Copy products from Cloud POS and keep online selling inventory updated in this repository.
              </p>

              <div className="mt-5 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Cloud POS Products Endpoint URL
                  <input
                    value={syncEndpoint}
                    onChange={(e) => setSyncEndpoint(e.target.value)}
                    placeholder="https://your-cloud-pos-domain.com/api/products?limit=500"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  API Key (optional)
                  <input
                    value={syncApiKey}
                    onChange={(e) => setSyncApiKey(e.target.value)}
                    placeholder="Optional bearer/x-api-key"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>

                <button
                  type="button"
                  disabled={syncing}
                  onClick={() => void handleSyncFromCloudPos()}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <Route size={16} /> {syncing ? "Syncing..." : "Sync Now"}
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-cyan-800">What this does</p>
                <p className="mt-2">1. Pull products from Cloud POS API.</p>
                <p>2. Upsert items into this online store inventory using SKU.</p>
                <p>3. Make synced items ready for marketing + order flows.</p>
              </div>
            </section>

            <section className="surface-card rounded-3xl p-6">
              <h2 className="font-display text-2xl font-bold text-slate-900">Sync Result</h2>
              {syncResult ? (
                <div className="mt-4 space-y-3 text-sm">
                  <p className="rounded-xl bg-cyan-50 px-3 py-2">
                    Imported: <strong>{syncResult.imported}</strong> | Skipped: <strong>{syncResult.skipped}</strong> | Received: <strong>{syncResult.totalReceived}</strong>
                  </p>
                  <p className="text-xs text-slate-600">Endpoint: {syncResult.endpointUrl}</p>

                  <div className="max-h-[420px] space-y-2 overflow-auto">
                    {(syncResult.sample || []).map((item: any) => (
                      <div key={item.sku} className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-600">{item.sku} | {item.category}</p>
                        <p className="text-xs text-slate-600">
                          Stock: {item.stockQty} | Price: Rs {Number(item.onlinePrice || item.posPrice || 0).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-cyan-200 bg-cyan-50 p-6 text-sm text-slate-700">
                  Run a sync to see import summary and sample products.
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "tracking" && (
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="surface-card rounded-3xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Tracked Days</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{tracking.summary.days}</p>
              </div>
              <div className="surface-card rounded-3xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Total Events</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{tracking.summary.totalEvents}</p>
              </div>
              <div className="surface-card rounded-3xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Unique Visitors</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{tracking.summary.totalUniqueVisitors}</p>
              </div>
              <div className="surface-card rounded-3xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Status</p>
                <p className="mt-2 inline-flex rounded-full bg-cyan-100 px-3 py-1 text-sm font-semibold text-cyan-700">
                  {loadingTracking ? "Loading" : "Live"}
                </p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="surface-card rounded-3xl p-6">
                <h2 className="font-display text-2xl font-bold text-slate-900">Top Pages</h2>
                <div className="mt-4 space-y-2">
                  {tracking.topPages.map((entry) => (
                    <div key={entry.pageUrl} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                      <span className="truncate pr-3">{entry.pageUrl}</span>
                      <span className="font-semibold text-cyan-700">{entry.count}</span>
                    </div>
                  ))}
                  {!loadingTracking && tracking.topPages.length === 0 && (
                    <p className="text-sm text-slate-600">No page events available.</p>
                  )}
                </div>
              </div>

              <div className="surface-card rounded-3xl p-6">
                <h2 className="font-display text-2xl font-bold text-slate-900">Top Events</h2>
                <div className="mt-4 space-y-2">
                  {tracking.topEvents.map((entry) => (
                    <div key={entry.eventName} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                      <span className="inline-flex items-center gap-2">
                        <Tag size={14} className="text-cyan-700" /> {entry.eventName}
                      </span>
                      <span className="font-semibold text-cyan-700">{entry.count}</span>
                    </div>
                  ))}
                  {!loadingTracking && tracking.topEvents.length === 0 && (
                    <p className="text-sm text-slate-600">No event data available.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="surface-card rounded-3xl p-6">
              <h2 className="font-display text-2xl font-bold text-slate-900">Daily Trend</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="px-2 py-2 font-semibold">Date</th>
                      <th className="px-2 py-2 font-semibold">Events</th>
                      <th className="px-2 py-2 font-semibold">Unique Visitors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tracking.dailyTrend.map((entry) => (
                      <tr key={entry.date} className="border-b border-slate-100">
                        <td className="px-2 py-2 font-medium text-slate-900">{entry.date}</td>
                        <td className="px-2 py-2 text-cyan-700">{entry.events}</td>
                        <td className="px-2 py-2 text-slate-600">{entry.uniqueVisitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!loadingTracking && tracking.dailyTrend.length === 0 && (
                <p className="mt-4 text-sm text-slate-600">No daily trend data available.</p>
              )}
            </section>

            <section className="surface-card rounded-3xl p-6">
              <h2 className="font-display text-2xl font-bold text-slate-900">Recent Tracking Events</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="px-2 py-2 font-semibold">Event</th>
                      <th className="px-2 py-2 font-semibold">Page</th>
                      <th className="px-2 py-2 font-semibold">Visitor</th>
                      <th className="px-2 py-2 font-semibold">Role</th>
                      <th className="px-2 py-2 font-semibold">Campaign</th>
                      <th className="px-2 py-2 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tracking.recentEvents.map((event) => (
                      <tr key={event._id} className="border-b border-slate-100">
                        <td className="px-2 py-2 font-medium text-slate-900">{event.eventName}</td>
                        <td className="px-2 py-2 text-slate-600">{event.pageUrl}</td>
                        <td className="px-2 py-2 text-slate-600">{event.visitorId}</td>
                        <td className="px-2 py-2 text-slate-600">{event.userRole || "guest"}</td>
                        <td className="px-2 py-2 text-slate-600">{event.utmCampaign || "-"}</td>
                        <td className="px-2 py-2 text-slate-600">{new Date(event.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!loadingTracking && tracking.recentEvents.length === 0 && (
                <p className="mt-4 text-sm text-slate-600">No recent events found.</p>
              )}
            </section>
          </div>
        )}

        {(loadingProducts || loadingPosts || loadingOrders || loadingTracking) && (
          <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Loading admin data...
          </p>
        )}

        <div className="mt-8 text-center text-xs text-slate-500">
          <p className="inline-flex items-center gap-2">
            <UserRound size={12} />
            Admin Marketing Module • Sinhala content + font selection + tracking + dispatch tools
          </p>
        </div>
    </>
  );
}
