"use server";

import { revalidatePath } from "next/cache";

import { getAuthenticatedUser, isAdmin } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasServiceRoleEnv } from "@/lib/supabase/admin";

async function requireAdmin() {
  const user = await getAuthenticatedUser();
  if (!user || !(await isAdmin(user))) return null;
  return user;
}

function revalidateMembers() {
  revalidatePath("/portal/members");
  revalidatePath("/portal/applications");
  revalidatePath("/portal");
  revalidatePath("/researchers");
}

export async function setMemberTitle(profileId: string, title: string) {
  const user = await requireAdmin();
  if (!user) return { ok: false as const, error: "Not authorized." };

  const trimmed = title.trim();
  if (trimmed.length > 120) {
    return { ok: false as const, error: "Title is too long." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ title: trimmed || null })
    .eq("id", profileId);

  if (error) return { ok: false as const, error: error.message };

  revalidateMembers();
  return { ok: true as const };
}

export async function setMemberAdmin(profileId: string, makeAdmin: boolean) {
  const user = await requireAdmin();
  if (!user) return { ok: false as const, error: "Not authorized." };

  if (profileId === user.id && !makeAdmin) {
    return {
      ok: false as const,
      error: "You cannot remove your own admin access.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: makeAdmin ? "director" : "student" })
    .eq("id", profileId);

  if (error) return { ok: false as const, error: error.message };

  revalidateMembers();
  return { ok: true as const };
}

export async function removeMember(profileId: string) {
  const user = await requireAdmin();
  if (!user) return { ok: false as const, error: "Not authorized." };

  if (profileId === user.id) {
    return { ok: false as const, error: "You cannot remove your own account." };
  }

  if (!hasServiceRoleEnv()) {
    return {
      ok: false as const,
      error: "Account removal requires SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const admin = await createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(profileId);

  if (error) return { ok: false as const, error: error.message };

  revalidateMembers();
  return { ok: true as const };
}
