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

  const { data: application, error: fetchError } = await supabase
    .from("applications")
    .select("profile_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) return { ok: false as const, error: fetchError.message };
  if (!application) {
    return { ok: false as const, error: "Application not found." };
  }

  const { error } = await supabase
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false as const, error: error.message };

  // Approval makes the applicant a member; a denial marks them a visitor.
  const title =
    status === "approved" ? "member" : status === "rejected" ? "visitor" : null;

  if (title) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ title })
      .eq("id", application.profile_id);

    if (profileError) {
      return { ok: false as const, error: profileError.message };
    }
  }

  revalidatePath("/portal/applications");
  revalidatePath("/portal/members");
  revalidatePath("/portal");
  return { ok: true as const };
}
