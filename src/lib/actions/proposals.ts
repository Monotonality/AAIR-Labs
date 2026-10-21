"use server";

import { revalidatePath } from "next/cache";

import { getAuthenticatedUser, isDirector } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import type { ProposalReviewDecision } from "@/lib/types";
import { parseDirectorFeedback, parseProposalInput } from "@/lib/validation/proposals";

function revalidateProposals(id?: string) {
  revalidatePath("/proposals");
  revalidatePath("/portal");
  revalidatePath("/portal/proposals");
  revalidatePath("/portal/proposals/review");
  if (id) revalidatePath(`/proposals/${id}`);
}

export async function createProposal(input: unknown) {
  const user = await getAuthenticatedUser();
  if (!user) return { ok: false as const, error: "Sign in to submit a proposal." };

  const parsed = parseProposalInput(input);
  if (!parsed.ok) return { ok: false as const, error: parsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .insert({
      author_id: user.id,
      title: parsed.data.title,
      summary: parsed.data.summary,
      category: parsed.data.category,
      details: parsed.data.details,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { ok: false as const, error: error.message };

  revalidateProposals(data.id);
  return { ok: true as const, id: data.id as string };
}

export async function updateProposal(id: string, input: unknown) {
  const user = await getAuthenticatedUser();
  if (!user) return { ok: false as const, error: "Sign in to edit a proposal." };

  const parsed = parseProposalInput(input);
  if (!parsed.ok) return { ok: false as const, error: parsed.error };

  const supabase = await createClient();
  const { data: proposal, error: fetchError } = await supabase
    .from("proposals")
    .select("author_id, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) return { ok: false as const, error: fetchError.message };
  if (!proposal) return { ok: false as const, error: "Proposal not found." };

  const director = await isDirector(user);
  const isAuthor = proposal.author_id === user.id;
  if (!director && !(isAuthor && proposal.status === "rejected")) {
    return {
      ok: false as const,
      error: "Only a director can edit this proposal, or the author can resubmit after a rejection.",
    };
  }

  const patch: Record<string, unknown> = {
    title: parsed.data.title,
    summary: parsed.data.summary,
    category: parsed.data.category,
    details: parsed.data.details,
    updated_at: new Date().toISOString(),
  };

  if (!director) {
    patch.status = "pending";
    patch.reviewed_at = null;
    patch.reviewed_by = null;
  }

  const { error } = await supabase.from("proposals").update(patch).eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidateProposals(id);
  return { ok: true as const, id };
}

export async function reviewProposal(
  id: string,
  decision: ProposalReviewDecision,
  feedback: unknown,
) {
  const user = await getAuthenticatedUser();
  if (!user || !(await isDirector(user))) {
    return { ok: false as const, error: "Not authorized." };
  }
  if (decision !== "approve" && decision !== "deny") {
    return { ok: false as const, error: "Unknown review decision." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("proposals")
    .update({
      status: decision === "approve" ? "approved" : "rejected",
      director_feedback: parseDirectorFeedback(feedback),
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false as const, error: error.message };

  revalidateProposals(id);
  return { ok: true as const };
}

export async function setProposalVisibility(id: string, isPublic: boolean) {
  const user = await getAuthenticatedUser();
  if (!user || !(await isDirector(user))) {
    return { ok: false as const, error: "Not authorized." };
  }
  if (typeof isPublic !== "boolean") {
    return { ok: false as const, error: "Visibility must be public or private." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("proposals")
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false as const, error: error.message };

  revalidateProposals(id);
  return { ok: true as const };
}
