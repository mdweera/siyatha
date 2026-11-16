import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShieldCheck, Heart, Settings } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Real app will fetch from /api/user/dashboard
  const user = session.user;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b pb-4">
            Hello, {user.name?.split(' ')[0] || 'User'}
          </h2>
          <nav className="mt-8 space-y-2">
            <Link href="/dashboard/orders" className="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <Package className="w-5 h-5" />
              <span>My Orders</span>
            </Link>
            <Link href="/dashboard/warranty" className="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <ShieldCheck className="w-5 h-5" />
              <span>Warranty Info</span>
            </Link>
            <Link href="/dashboard/favorites" className="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <Heart className="w-5 h-5" />
              <span>Favorites</span>
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Orders</p>
                <h3 className="text-2xl font-bold text-gray-900">0</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Items Under Warranty</p>
                <h3 className="text-2xl font-bold text-gray-900">0</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-50 text-cyan-700 rounded-lg">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Favorites</p>
                <h3 className="text-2xl font-bold text-gray-900">0</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Purchases</h3>
          </div>
          <div className="p-6 text-center text-gray-500">
            You haven't made any purchases yet.
          </div>
        </div>
      </main>
    </div>
  );
}