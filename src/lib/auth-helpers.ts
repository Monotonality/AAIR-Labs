import type { User } from "@supabase/supabase-js";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export async function getAuthenticatedUser(): Promise<User | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserRole(user: User): Promise<UserRole | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return (data?.role as UserRole | undefined) ?? null;
}

export async function isDirector(user: User): Promise<boolean> {
  return (await getUserRole(user)) === "director";
}

/**
 * "Admin" access is backed by the `director` role — the database has no
 * separate admin role. Admins can review applications and manage events.
 */
export async function isAdmin(user: User): Promise<boolean> {
  return isDirector(user);
}