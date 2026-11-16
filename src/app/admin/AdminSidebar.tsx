"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  Megaphone,
  PackageSearch,
  Route,
  ShoppingCart,
  Users,
} from "lucide-react";

type AdminSidebarProps = {
  isAdmin: boolean;
};

export default function AdminSidebar({ isAdmin }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
      active
        ? "bg-cyan-50 text-cyan-900 font-semibold border-l-4 border-cyan-600"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const isMarketingTabActive = (tab: string) =>
    pathname === "/admin/marketing" && activeTab === tab;

  return (
    <aside className="sticky top-0 h-screen w-72 border-r border-slate-200 bg-white text-slate-900 shadow-lg">
      <div className="p-6">
        <h2 className="border-b border-slate-200 pb-4 text-2xl font-bold tracking-tight text-slate-900">
          Siyatha Admin
        </h2>

        <nav className="mt-8 space-y-2">
          <Link href="/admin" className={linkClass(pathname === "/admin")}>
            <LayoutDashboard className="h-5 w-5" />
            <span>Overview</span>
          </Link>

          <Link
            href="/admin/marketing?tab=orders"
            className={linkClass(isMarketingTabActive("orders"))}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Orders & Dispatch</span>
          </Link>

          <Link
            href="/admin/marketing?tab=inventory"
            className={linkClass(isMarketingTabActive("inventory"))}
          >
            <PackageSearch className="h-5 w-5" />
            <span>Inventory View</span>
          </Link>

          <Link
            href="/admin/marketing?tab=posts"
            className={linkClass(isMarketingTabActive("posts"))}
          >
            <Megaphone className="h-5 w-5" />
            <span>Marketing Posts</span>
          </Link>

          <Link
            href="/admin/marketing?tab=sync"
            className={linkClass(isMarketingTabActive("sync"))}
          >
            <Route className="h-5 w-5" />
            <span>Cloud POS Sync</span>
          </Link>

          <Link
            href="/admin/marketing?tab=tracking"
            className={linkClass(isMarketingTabActive("tracking"))}
          >
            <Activity className="h-5 w-5" />
            <span>User Tracking</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin/users"
              className={linkClass(pathname.startsWith("/admin/users"))}
            >
              <Users className="h-5 w-5" />
              <span>Users & Staff</span>
            </Link>
          )}
        </nav>
      </div>
    </aside>
  );
}
