"use server";

import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";

import { getAuthenticatedUser, isDirector } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import type { ProposalReviewDecision } from "@/lib/types";
import { parseDirectorFeedback } from "@/lib/validation/proposals";
import {
  parseProjectCreate,
  parseProjectDetails,
  parseTagList,
} from "@/lib/validation/projects";

const MAX_BYTES = 20 * 1024 * 1024; // 20MB, matches the bucket limit.
const WORKING_PAPER_FILE = "working-paper.pdf"; // fixed path → newest replaces the old object.

type ActionResult = { ok: true; id: string } | { ok: false; error: string };

function revalidateProjects(id?: string) {
  revalidatePath("/projects");
  revalidatePath("/portal");
  revalidatePath("/portal/projects/review");
  revalidatePath("/library");
  if (id) {
    revalidatePath(`/projects/${id}`);
    revalidatePath(`/library/${id}`);
  }
}

async function fetchProjectRole(
  id: string,
  user: User,
): Promise<
  | { ok: true; status: string; isLead: boolean; isDirector: boolean }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("author_id, status")
    .eq("id", id)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Project not found." };

  return {
    ok: true,
    status: data.status,
    isLead: data.author_id === user.id,
    isDirector: await isDirector(user),
  };
}

/** Directors turn an approved proposal (or a blank form) into a project. */
export async function createProject(input: unknown): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { ok: false, error: "Sign in to create a project." };
  if (!(await isDirector(user))) {
    return { ok: false, error: "Only a director can create a project." };
  }

  const parsed = parseProjectCreate(input);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const { proposal_id, title, abstract, category, target_domain, lead_id, co_author_ids } =
    parsed.data;

  const supabase = await createClient();

  if (proposal_id) {
    const { data: proposal, error } = await supabase
      .from("proposals")
      .select("id, status")
      .eq("id", proposal_id)
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!proposal) return { ok: false, error: "Proposal not found." };
    if (proposal.status !== "approved") {
      return { ok: false, error: "Only approved proposals can become projects." };
    }
  }

  const rosterIds = [lead_id, ...co_author_ids];
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id")
    .in("id", rosterIds);
  if (profilesError) return { ok: false, error: profilesError.message };
  if ((profiles?.length ?? 0) !== new Set(rosterIds).size) {
    return { ok: false, error: "One of the chosen researchers is not a member." };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      author_id: lead_id,
      proposal_id: proposal_id || null,
      title,
      abstract,
      category,
      target_domain: target_domain || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (projectError) return { ok: false, error: projectError.message };

  const roster = [
    { project_id: project.id, profile_id: lead_id, role: "author", position: 0 },
    ...co_author_ids.map((profileId, index) => ({
      project_id: project.id,
      profile_id: profileId,
      role: "co_author" as const,
      position: index + 1,
    })),
  ];
  const { error: rosterError } = await supabase.from("project_authors").insert(roster);
  if (rosterError) {
    await supabase.from("projects").delete().eq("id", project.id);
    return { ok: false, error: rosterError.message };
  }

  revalidateProjects(project.id);
  return { ok: true, id: project.id as string };
}

/** Lead or director edit the project details; a rejected lead edit resubmits. */
export async function updateProjectDetails(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { ok: false, error: "Sign in to edit the project." };

  const role = await fetchProjectRole(id, user);
  if (!role.ok) return { ok: false, error: role.error };
  if (!role.isDirector && !role.isLead) {
    return { ok: false, error: "Only the lead researcher or a director can edit this project." };
  }
  // Mirrors proposals: leads edit only after a denial (to resubmit); pending
  // work is under director review, and approved projects are locked.
  if (!role.isDirector && role.status !== "rejected") {
    return {
      ok: false,
      error:
        role.status === "approved"
          ? "Approved projects are locked — ask a director to reopen it first."
          : "The project is under review, so its details are locked until the director responds. You can still upload working-paper versions.",
    };
  }

  const parsed = parseProjectDetails(input);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const patch: Record<string, unknown> = {
    title: parsed.data.title,
    abstract: parsed.data.abstract,
    target_domain: parsed.data.target_domain || null,
    topics: parseTagList(parsed.data.topics),
    geographic_scope: parseTagList(parsed.data.geographic_scope),
    methodology: parseTagList(parsed.data.methodology),
    data_sources: parseTagList(parsed.data.data_sources),
    updated_at: new Date().toISOString(),
  };

  if (role.isDirector && parsed.data.category) {
    patch.category = parsed.data.category;
  }

  if (!role.isDirector && role.status === "rejected") {
    patch.status = "pending";
    patch.status_reviewed_at = null;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("projects").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateProjects(id);
  return { ok: true, id };
}

/**
 * Lead or director upload the working paper. The object path is fixed per
 * project, so each upload replaces the previous file; the single draft row is
 * bumped to the next version. A rejected project resubmits as pending.
 */
export async function uploadWorkingPaper(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { ok: false, error: "Sign in to upload." };

  const role = await fetchProjectRole(id, user);
  if (!role.ok) return { ok: false, error: role.error };
  if (!role.isDirector && !role.isLead) {
    return { ok: false, error: "Only the lead researcher or a director can upload." };
  }
  if (role.status === "approved") {
    return {
      ok: false,
      error: "Approved projects are locked — ask a director to reopen it first.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a PDF file." };
  }
  if (file.type !== "application/pdf") {
    return { ok: false, error: "Only PDF files are accepted." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "PDF must be 20MB or smaller." };
  }

  const supabase = await createClient();

  const { data: existing, error: draftError } = await supabase
    .from("paper_drafts")
    .select("id, version")
    .eq("project_id", id)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (draftError) return { ok: false, error: draftError.message };

  const version = (existing?.version ?? 0) + 1;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const storagePath = `${id}/${WORKING_PAPER_FILE}`;

  const { error: uploadError } = await supabase.storage
    .from("research-papers")
    .upload(storagePath, bytes, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (uploadError) return { ok: false, error: uploadError.message };

  const now = new Date().toISOString();
  const { error: upsertError } = existing
    ? await supabase
        .from("paper_drafts")
        .update({
          version,
          pdf_storage_path: storagePath,
          status: "under_review",
          published_at: null,
        })
        .eq("id", existing.id)
    : await supabase.from("paper_drafts").insert({
        project_id: id,
        version,
        pdf_storage_path: storagePath,
        status: "under_review",
      });
  if (upsertError) return { ok: false, error: upsertError.message };

  const { error: projectError } = await supabase
    .from("projects")
    .update({
      status: role.status === "rejected" ? "pending" : role.status,
      status_reviewed_at: role.status === "rejected" ? null : undefined,
      updated_at: now,
    })
    .eq("id", id);
  if (projectError) return { ok: false, error: projectError.message };

  revalidateProjects(id);
  return { ok: true, id };
}

/** Director approve/deny. Approving requires an uploaded working paper. */
export async function reviewProject(
  id: string,
  decision: ProposalReviewDecision,
  feedback: unknown,
): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user || !(await isDirector(user))) {
    return { ok: false, error: "Not authorized." };
  }
  if (decision !== "approve" && decision !== "deny") {
    return { ok: false, error: "Unknown review decision." };
  }

  const supabase = await createClient();
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("id, status, draft:paper_drafts(id, pdf_storage_path)")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!project) return { ok: false, error: "Project not found." };

  const drafts = (project.draft ?? []) as { id: string; pdf_storage_path: string | null }[];
  if (decision === "approve" && !drafts.some((d) => d.pdf_storage_path)) {
    return { ok: false, error: "Upload a working paper before approving." };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("projects")
    .update({
      status: decision === "approve" ? "approved" : "rejected",
      director_feedback: parseDirectorFeedback(feedback),
      status_reviewed_at: now,
      updated_at: now,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  // Keep draft status in sync (best-effort) so the legacy published-paper
  // queries and the library agree with the project status.
  await supabase
    .from("paper_drafts")
    .update(
      decision === "approve"
        ? { status: "published", published_at: now }
        : { status: "revision_required", published_at: null },
    )
    .eq("project_id", id);

  revalidateProjects(id);
  return { ok: true, id };
}

/** Director reopen an approved project so the team can edit and re-upload. */
export async function reopenProject(id: string): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user || !(await isDirector(user))) {
    return { ok: false, error: "Not authorized." };
  }

  const supabase = await createClient();
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!project) return { ok: false, error: "Project not found." };
  if (project.status !== "approved") {
    return { ok: false, error: "Only an approved project can be reopened." };
  }

  const { error } = await supabase
    .from("projects")
    .update({
      status: "pending",
      status_reviewed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await supabase
    .from("paper_drafts")
    .update({ status: "under_review", published_at: null })
    .eq("project_id", id);

  revalidateProjects(id);
  return { ok: true, id };
}
