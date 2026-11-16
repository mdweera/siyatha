export function trackEvent(eventName: string, metadata?: Record<string, unknown>): void {
  if (typeof window === "undefined") {
    return;
  }

  const key = "siyatha-visitor";
  const existing = window.localStorage.getItem(key);
  const visitorId = existing || crypto.randomUUID();
  if (!existing) {
    window.localStorage.setItem(key, visitorId);
  }

  fetch("/api/tracking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visitorId,
      eventName,
      pageUrl: window.location.pathname,
      pageTitle: document.title,
      metadata,
    }),
  }).catch(() => undefined);
}
