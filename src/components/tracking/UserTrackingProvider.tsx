"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const VISITOR_KEY = "siyatha_visitor_id";
const SESSION_KEY = "siyatha_session_id";

function getPersistentId(key: string, prefix: string, storage: Storage) {
  const existing = storage.getItem(key);
  if (existing) return existing;

  const generated = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  storage.setItem(key, generated);
  return generated;
}

function TrackingInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const visitorId = getPersistentId(VISITOR_KEY, "v", window.localStorage);
    const sessionId = getPersistentId(SESSION_KEY, "s", window.sessionStorage);

    const payload = {
      visitorId,
      sessionId,
      eventName: "page_view",
      pageUrl: `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`,
      pageTitle: document.title,
      referrer: document.referrer || undefined,
      utmSource: searchParams?.get("utm_source") || undefined,
      utmMedium: searchParams?.get("utm_medium") || undefined,
      utmCampaign: searchParams?.get("utm_campaign") || undefined,
      utmTerm: searchParams?.get("utm_term") || undefined,
      utmContent: searchParams?.get("utm_content") || undefined,
      metadata: {
        lang: document.documentElement.lang,
      },
    };

    fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Tracking should never block UX.
    });
  }, [pathname, searchParams]);

  return null;
}

export default function UserTrackingProvider() {
  return (
    <Suspense fallback={null}>
      <TrackingInner />
    </Suspense>
  );
}
