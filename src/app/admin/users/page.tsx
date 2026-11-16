import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Users, ShieldCheck, UserRoundCog, UserRound } from "lucide-react";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

type UserRole = "ADMIN" | "STAFF" | "USER";

type UserRecord = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  createdAt: string;
};

function normalizeRoleFilter(value: string | undefined): UserRole | "all" {
  if (value === "ADMIN" || value === "STAFF" || value === "USER") {
    return value;
  }
  return "all";
}

function roleBadgeClass(role: UserRole) {
  if (role === "ADMIN") return "bg-violet-100 text-violet-700";
  if (role === "STAFF") return "bg-sky-100 text-sky-700";
  return "bg-slate-100 text-slate-700";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string | string[] }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const resolvedSearch = await searchParams;
  const roleQuery = Array.isArray(resolvedSearch.role)
    ? resolvedSearch.role[0]
    : resolvedSearch.role;
  const roleFilter = normalizeRoleFilter(roleQuery);

  await dbConnect();

  const userQuery = roleFilter === "all" ? {} : { role: roleFilter };

  const [usersRaw, roleSummaryRaw] = await Promise.all([
    User.find(userQuery)
      .sort({ createdAt: -1 })
      .select("name phone email role createdAt")
      .lean(),
    User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const users = JSON.parse(JSON.stringify(usersRaw)) as UserRecord[];

  const roleCounts = {
    ADMIN: 0,
    STAFF: 0,
    USER: 0,
  };

  for (const item of roleSummaryRaw) {
    const roleKey = String(item?._id || "");
    if (roleKey === "ADMIN" || roleKey === "STAFF" || roleKey === "USER") {
      roleCounts[roleKey as UserRole] = Number(item?.count || 0);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Admin Panel</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Users & Staff Management</h1>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Back to Dashboard
        </Link>
      </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Admins</p>
            <p className="mt-2 inline-flex items-center gap-2 text-3xl font-bold text-violet-700">
              <ShieldCheck className="h-7 w-7" /> {roleCounts.ADMIN}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Staff</p>
            <p className="mt-2 inline-flex items-center gap-2 text-3xl font-bold text-sky-700">
              <UserRoundCog className="h-7 w-7" /> {roleCounts.STAFF}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Customers</p>
            <p className="mt-2 inline-flex items-center gap-2 text-3xl font-bold text-slate-700">
              <UserRound className="h-7 w-7" /> {roleCounts.USER}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-xl font-bold text-slate-900">
              <Users className="h-5 w-5" /> User Directory
            </h2>

            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <Link
                href="/admin/users"
                className={`rounded-full px-3 py-1.5 ${
                  roleFilter === "all"
                    ? "bg-cyan-100 text-cyan-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </Link>
              <Link
                href="/admin/users?role=ADMIN"
                className={`rounded-full px-3 py-1.5 ${
                  roleFilter === "ADMIN"
                    ? "bg-cyan-100 text-cyan-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Admin
              </Link>
              <Link
                href="/admin/users?role=STAFF"
                className={`rounded-full px-3 py-1.5 ${
                  roleFilter === "STAFF"
                    ? "bg-cyan-100 text-cyan-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Staff
              </Link>
              <Link
                href="/admin/users?role=USER"
                className={`rounded-full px-3 py-1.5 ${
                  roleFilter === "USER"
                    ? "bg-cyan-100 text-cyan-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                User
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-2 py-2 font-semibold">Name</th>
                  <th className="px-2 py-2 font-semibold">Phone</th>
                  <th className="px-2 py-2 font-semibold">Email</th>
                  <th className="px-2 py-2 font-semibold">Role</th>
                  <th className="px-2 py-2 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-slate-100">
                    <td className="px-2 py-2 font-medium text-slate-900">{user.name}</td>
                    <td className="px-2 py-2 text-slate-700">{user.phone}</td>
                    <td className="px-2 py-2 text-slate-600">{user.email || "-"}</td>
                    <td className="px-2 py-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-slate-600">{new Date(user.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <p className="mt-4 text-sm text-slate-600">No users found for this role filter.</p>
          )}
        </section>
    </>
  );
}
