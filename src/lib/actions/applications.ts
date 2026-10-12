"use server";

import { revalidatePath } from "next/cache";

import { getAuthenticatedUser, isAdmin } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/lib/types";

const STATUSES: ApplicationStatus[] = ["pending", "approved", "rejected"];

export async function setApplicationStatus(
  id: string,
  status: ApplicationStatus,
) {
  const user = await getAuthenticatedUser();
  if (!user || !(await isAdmin(user))) {
    return { ok: false as const, error: "Not authorized." };
  }
  if (!STATUSES.includes(status)) {
    return { ok: false as const, error: "Unknown status." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/portal/applications");
  revalidatePath("/portal");
  return { ok: true as const };
}
