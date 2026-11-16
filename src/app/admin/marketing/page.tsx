import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminMarketingClient from "./AdminMarketingClient";

type MarketingTab = "posts" | "orders" | "inventory" | "sync" | "tracking";

function normalizeTab(value: string | undefined): MarketingTab {
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

export default async function AdminMarketingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const rawTab = Array.isArray(resolvedParams.tab) ? resolvedParams.tab[0] : resolvedParams.tab;
  const initialTab = normalizeTab(rawTab);

  return (
    <AdminMarketingClient
      currentUser={{
        id: session.user.id,
        role: session.user.role,
        name: session.user.name || "Admin",
      }}
      initialTab={initialTab}
    />
  );
}
