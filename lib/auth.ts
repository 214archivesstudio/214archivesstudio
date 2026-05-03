import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/database";

export interface AuthenticatedAdminUser {
  readonly id: string;
  readonly email: string | null;
  readonly role: AppRole;
}

/**
 * Server-side: returns the current authenticated admin user with their role,
 * or null if unauthenticated / unauthorized.
 *
 * Use in Server Components, Server Actions, and Route Handlers.
 */
export async function getCurrentAdminUser(): Promise<AuthenticatedAdminUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const result = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const roleRow = result.data as { role: AppRole } | null;
  if (!roleRow) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    role: roleRow.role,
  };
}

/**
 * Server-side guard: redirects to /admin/login if not authenticated as admin/editor.
 * Returns the admin user when allowed.
 */
export async function requireAuthenticatedAdmin(): Promise<AuthenticatedAdminUser> {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

/**
 * Server-side guard: redirects unless the user has admin role specifically.
 */
export async function requireAdmin(): Promise<AuthenticatedAdminUser> {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "admin") redirect("/admin?error=admin_required");
  return user;
}
