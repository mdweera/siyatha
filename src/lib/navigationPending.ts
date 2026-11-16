export type NavigationPendingDetail = {
  label?: string;
};

export const NAVIGATION_PENDING_EVENT = "siyatha:pending-nav";

export function signalNavigationPending(label = "Loading"): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent<NavigationPendingDetail>(NAVIGATION_PENDING_EVENT, {
      detail: { label },
    })
  );
}
