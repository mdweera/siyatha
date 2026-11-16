import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEFAULT_PRIVILEGED_ROLES = ["ADMIN", "STAFF"] as const;

export async function getPrivilegedSession(roles: readonly string[] = DEFAULT_PRIVILEGED_ROLES) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || !roles.includes(session.user.role)) {
    return null;
  }

  return session;
}
