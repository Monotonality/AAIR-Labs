import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { Proposal, ProposalDetails } from "@/lib/types";

// Two FKs point at profiles (author_id, reviewed_by), so the embed must name
// the column PostgREST should follow.
const PROPOSAL_SELECT = "*, author:profiles!author_id(*)";

const EMPTY_DETAILS: ProposalDetails = { priorWorks: [], deliverables: "" };

function asProposal(row: unknown): Proposal {
  const proposal = row as Proposal;
  return {
    ...proposal,
    details: proposal.details ?? EMPTY_DETAILS,
  };
}

export async function getPublicProposals(): Promise<Proposal[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select(PROPOSAL_SELECT)
    .eq("status", "approved")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPublicProposals", error.message);
    return [];
  }
  return (data ?? []).map(asProposal);
}

export async function getProposalById(id: string): Promise<Proposal | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select(PROPOSAL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getProposalById", error.message);
    return null;
  }
  return data ? asProposal(data) : null;
}

export async function getProposalsByAuthor(
  authorId: string,
): Promise<Proposal[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select(PROPOSAL_SELECT)
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getProposalsByAuthor", error.message);
    return [];
  }
  return (data ?? []).map(asProposal);
}

export async function getAllProposals(): Promise<Proposal[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select(PROPOSAL_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllProposals", error.message);
    return [];
  }
  return (data ?? []).map(asProposal);
}

/** Approved proposals a director can turn into a project. */
export async function getApprovedProposals(): Promise<Proposal[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select(PROPOSAL_SELECT)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getApprovedProposals", error.message);
    return [];
  }
  return (data ?? []).map(asProposal);
}
