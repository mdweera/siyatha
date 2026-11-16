import { redirect } from "next/navigation";

export default function AdminTrackingRedirectPage() {
  redirect("/admin/marketing?tab=tracking");
}
