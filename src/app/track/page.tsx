"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { Loader2, PackageSearch } from "lucide-react";
import { formatRs } from "@/lib/storefront";
import LoginButton from "@/components/auth/LoginButton";

const STEPS = ["received", "printing", "packed", "shipped", "delivered"] as const;

const STEP_LABEL: Record<string, string> = {
  received: "Received",
  printing: "Printing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  pending: "Received",
  processing: "Printing",
  cancelled: "Cancelled",
};

type TrackedOrder = {
  orderNumber: string;
  trackingCode: string;
  status: string;
  printStep: string | null;
  createdAt: string;
  totalAmount: number;
  deliveryCharge: number;
  city: string;
  items: Array<{ name: string; quantity: number; kind: string }>;
};

function TrackForm() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const lookup = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Enter your tracking code.");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const response = await fetch(`/api/orders/track?code=${encodeURIComponent(trimmed)}`);
      const payload = (await response.json()) as TrackedOrder & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Could not find that order.");
      }
      setOrder(payload);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Could not find that order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initial = searchParams.get("code");
    if (initial) {
      void lookup(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void lookup(code);
  };

  const step = order ? String(order.printStep || order.status || "received") : "";
  const stepIndex = STEPS.indexOf(step as (typeof STEPS)[number]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold text-[var(--muted)]">Order tracking</p>
      <h1 className="mt-2 text-4xl font-bold">Track your order</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Use the tracking code from your order confirmation. Guests can track with the code. Signed-in customers can also open their account.
      </p>

      <form onSubmit={onSubmit} className="surface-card mt-6 p-5">
        <label htmlFor="tracking-code" className="text-sm font-semibold">
          Tracking code
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            id="tracking-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="SY-XXXXXX"
            className="min-w-0 flex-1 rounded-xl border border-[var(--line)] px-3 py-3 text-sm uppercase"
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <PackageSearch size={16} />}
            {loading ? "Checking" : "Track"}
          </button>
        </div>
        {error ? (
          <p className="mt-3 text-sm font-medium text-[var(--brand)]" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      {order ? (
        <article className="surface-card mt-5 p-5">
          <p className="text-sm font-semibold text-[var(--muted)]">{order.trackingCode}</p>
          <h2 className="mt-1 text-2xl font-bold">{STEP_LABEL[step] || step}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {order.orderNumber} · {new Date(order.createdAt).toLocaleString("en-LK")}
            {order.city ? ` · ${order.city}` : ""}
          </p>
          {step !== "cancelled" && stepIndex >= 0 ? (
            <ol className="mt-4 grid grid-cols-5 gap-2">
              {STEPS.map((item, index) => (
                <li
                  key={item}
                  className={`rounded-xl px-2 py-2 text-center text-xs font-bold ${
                    index <= stepIndex ? "bg-[#F2B400] text-[#111]" : "bg-white text-slate-400"
                  }`}
                >
                  {STEP_LABEL[item]}
                </li>
              ))}
            </ol>
          ) : null}
          <ul className="mt-4 space-y-1 text-sm">
            {order.items.map((item, index) => (
              <li key={`${item.name}-${index}`}>
                {item.quantity} × {item.name}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-bold">{formatRs(order.totalAmount)}</p>
        </article>
      ) : null}

      <p className="mt-6 text-sm text-[var(--muted)]">
        Want saved order history?{" "}
        <LoginButton className="font-semibold underline">Log in</LoginButton> and open your account.
      </p>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="px-4 py-10 text-sm text-[var(--muted)]">Loading tracker…</div>}>
      <TrackForm />
    </Suspense>
  );
}
