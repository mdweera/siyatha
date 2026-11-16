"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { NAVIGATION_PENDING_EVENT, type NavigationPendingDetail } from "@/lib/navigationPending";

const MIN_VISIBLE_MS = 500;

function NavigationFeedbackInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [label, setLabel] = useState("Loading");
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const lastRoute = useRef(routeKey);
  const startedAt = useRef(0);
  const hideTimer = useRef<number | null>(null);

  const clearHideTimer = () => {
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const start = (nextLabel: string) => {
    clearHideTimer();
    startedAt.current = Date.now();
    setLabel(nextLabel || "Loading");
    setPending(true);
  };

  const stopAfterMinimum = () => {
    clearHideTimer();
    const elapsed = Date.now() - startedAt.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    hideTimer.current = window.setTimeout(() => {
      setPending(false);
      hideTimer.current = null;
    }, wait);
  };

  useEffect(() => {
    if (lastRoute.current !== routeKey) {
      lastRoute.current = routeKey;
      if (pending || startedAt.current > 0) {
        stopAfterMinimum();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      try {
        const next = new URL(href, window.location.origin);
        if (next.origin !== window.location.origin) {
          return;
        }
        const current = `${window.location.pathname}${window.location.search}`;
        const destination = `${next.pathname}${next.search}`;
        if (current === destination) {
          return;
        }
        const text = (anchor.getAttribute("aria-label") || anchor.textContent || "").trim().replace(/\s+/g, " ").slice(0, 42);
        start(text || "Opening");
      } catch {
        return;
      }
    };

    const onPending = (event: Event) => {
      const detail = (event as CustomEvent<NavigationPendingDetail>).detail;
      start(detail?.label?.trim() || "Loading");
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener(NAVIGATION_PENDING_EVENT, onPending);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(NAVIGATION_PENDING_EVENT, onPending);
      clearHideTimer();
    };
  }, []);

  useEffect(() => {
    if (!pending) {
      return;
    }
    const safety = window.setTimeout(() => setPending(false), 10000);
    return () => window.clearTimeout(safety);
  }, [pending]);

  if (!pending) {
    return null;
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-1.5 overflow-hidden bg-[#F9E094]">
        <div className="nav-progress h-full w-1/3 bg-[#F2B400]" />
      </div>
      <div className="pointer-events-none fixed inset-0 z-[110] flex items-center justify-center bg-[#fff8ee]/70 backdrop-blur-[2px]">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-5 py-3.5 shadow-xl">
          <Loader2 size={20} className="animate-spin text-[#DE2684]" />
          <p className="text-sm font-semibold text-[var(--ink)]">{label}…</p>
        </div>
      </div>
    </>
  );
}

export default function NavigationFeedback() {
  return (
    <Suspense fallback={null}>
      <NavigationFeedbackInner />
    </Suspense>
  );
}
