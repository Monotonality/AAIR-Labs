"use server";

import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";

import { getAuthenticatedUser, isDirector } from "@/lib/auth-helpers";
import { DRAFT_STAGE_VALUES } from "@/lib/papers";
import { createClient } from "@/lib/supabase/server";
import type {
  DraftStage,
  ProjectEventKind,
  ProposalReviewDecision,
} from "@/lib/types";
import {
  parseProjectCreate,
  parseProjectDetails,
  parseProjectMembers,
  parseReviewComment,
  parseTagList,
} from "@/lib/validation/projects";

const MAX_BYTES = 20 * 1024 * 1024; // 20MB, matches the bucket limit.
const WORKING_PAPER_FILE = "working-paper.pdf"; // fixed path → newest replaces the old object.

type ActionResult = { ok: true; id: string } | { ok: false; error: string };
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function revalidateProjects(id?: string) {
  revalidatePath("/portal");
  revalidatePath("/portal/active-research");
  revalidatePath("/portal/my-research");
  revalidatePath("/portal/projects/review");
  revalidatePath("/library");
  revalidatePath("/researchers/[username]", "page");
  if (id) {
    revalidatePath(`/portal/active-research/${id}`);
    revalidatePath(`/portal/my-research/${id}`);
    revalidatePath(`/library/${id}`);
  }
}

async function fetchProjectRole(
  id: string,
  user: User,
): Promise<
  | { ok: true; status: string; leadId: string; isLead: boolean; isDirector: boolean }
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
    leadId: data.author_id,
    isLead: data.author_id === user.id,
    isDirector: await isDirector(user),
  };
}

/** Append one entry to the project's review history. */
async function logEvent(
  supabase: SupabaseServerClient,
  event: {
    project_id: string;
    actor_id: string;
    kind: ProjectEventKind;
    body?: string | null;
    draft_version?: number | null;
    stage?: DraftStage | null;
  },
): Promise<string | null> {
  const { error } = await supabase.from("project_review_events").insert({
    body: null,
    draft_version: null,
    stage: null,
    ...event,
  });
  return error ? `Saved, but the history entry failed: ${error.message}` : null;
}

/** Directors start a project, optionally from an approved proposal. */
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

/** The lead or a director edits the details and tags of a project in progress. */
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
  if (!role.isDirector && role.status === "approved") {
    return {
      ok: false,
      error: "This paper is published, so the project is locked. Ask a director to reopen it.",
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

  const supabase = await createClient();
  const { error } = await supabase.from("projects").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateProjects(id);
  return { ok: true, id };
}

/**
 * The lead (or a director) chooses co-authors. Directors can also change who
 * the lead is; a lead can never remove themselves.
 */
export async function setProjectMembers(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { ok: false, error: "Sign in to manage the team." };

  const role = await fetchProjectRole(id, user);
  if (!role.ok) return { ok: false, error: role.error };
  if (!role.isDirector && !role.isLead) {
    return { ok: false, error: "Only the lead researcher or a director can manage the team." };
  }
  if (!role.isDirector && role.status === "approved") {
    return {
      ok: false,
      error: "This paper is published, so the team is locked. Ask a director to reopen it.",
    };
  }

  const parsed = parseProjectMembers(input);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const leadId = role.isDirector && parsed.data.lead_id ? parsed.data.lead_id : role.leadId;
  const coAuthorIds = parsed.data.co_author_ids.filter((pid) => pid !== leadId);

  const supabase = await createClient();

  const wanted = [leadId, ...coAuthorIds];
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id")
    .in("id", wanted);
  if (profilesError) return { ok: false, error: profilesError.message };
  if ((profiles?.length ?? 0) !== wanted.length) {
    return { ok: false, error: "One of the chosen researchers is not a member." };
  }

  const { data: rows, error: rowsError } = await supabase
    .from("project_authors")
    .select("id, profile_id, role, position")
    .eq("project_id", id);
  if (rowsError) return { ok: false, error: rowsError.message };
  const current = rows ?? [];

  if (leadId !== role.leadId) {
    const { error } = await supabase
      .from("projects")
      .update({ author_id: leadId, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
  }

  // Remove anyone no longer on the team, and any row whose role must flip
  // (old lead → co-author, co-author → lead); those are re-inserted below.
  const desiredRole = (pid: string) => (pid === leadId ? "author" : "co_author");
  const stale = current.filter(
    (row) => !wanted.includes(row.profile_id) || row.role !== desiredRole(row.profile_id),
  );
  if (stale.length > 0) {
    const { error } = await supabase
      .from("project_authors")
      .delete()
      .in(
        "id",
        stale.map((row) => row.id),
      );
    if (error) return { ok: false, error: error.message };
  }

  const kept = new Set(
    current.filter((row) => !stale.includes(row)).map((row) => row.profile_id),
  );
  let nextPosition = current.reduce((max, row) => Math.max(max, row.position), 0) + 1;
  const additions = wanted
    .filter((pid) => !kept.has(pid))
    .map((pid) => ({
      project_id: id,
      profile_id: pid,
      role: desiredRole(pid),
      position: pid === leadId ? 0 : nextPosition++,
    }));
  if (additions.length > 0) {
    const { error } = await supabase.from("project_authors").insert(additions);
    if (error) return { ok: false, error: error.message };
  }

  revalidateProjects(id);
  return { ok: true, id };
}

/**
 * The lead or a director submits a PDF. The object path is fixed per project,
 * so each upload replaces the previous file; the single draft row moves to the
 * next version. A denied project goes back to pending for another review.
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
      error: "This paper is published, so the project is locked. Ask a director to reopen it.",
    };
  }

  const stageInput = String(formData.get("stage") ?? "");
  const stage = (DRAFT_STAGE_VALUES as string[]).includes(stageInput)
    ? (stageInput as DraftStage)
    : null;
  if (!stage) return { ok: false, error: "Choose what kind of paper this is." };

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

  const draftFields = {
    version,
    stage,
    pdf_storage_path: storagePath,
    status: "under_review" as const,
    published_at: null,
  };
  const { error: upsertError } = existing
    ? await supabase.from("paper_drafts").update(draftFields).eq("id", existing.id)
    : await supabase.from("paper_drafts").insert({ project_id: id, ...draftFields });
  if (upsertError) return { ok: false, error: upsertError.message };

  const { error: projectError } = await supabase
    .from("projects")
    .update({
      status: role.status === "rejected" ? "pending" : role.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (projectError) return { ok: false, error: projectError.message };

  const historyError = await logEvent(supabase, {
    project_id: id,
    actor_id: user.id,
    kind: "submitted",
    draft_version: version,
    stage,
  });

  revalidateProjects(id);
  return historyError ? { ok: false, error: historyError } : { ok: true, id };
}

/**
 * Director approve/deny of the current PDF. Approving publishes the paper
 * (library + researcher profiles); denying requires a reason.
 */
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

  const comment = parseReviewComment(feedback, decision === "deny");
  if (!comment.ok) {
    return {
      ok: false,
      error: decision === "deny" ? "Give a reason for the denial." : comment.error,
    };
  }

  const supabase = await createClient();
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("id, status, draft:paper_drafts(id, version, stage, pdf_storage_path)")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!project) return { ok: false, error: "Project not found." };

  const drafts = (project.draft ?? []) as {
    id: string;
    version: number;
    stage: DraftStage | null;
    pdf_storage_path: string | null;
  }[];
  const current = [...drafts].sort((a, b) => b.version - a.version)[0];
  if (!current?.pdf_storage_path) {
    return { ok: false, error: "There is no PDF to review yet." };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("projects")
    .update({
      status: decision === "approve" ? "approved" : "rejected",
      director_feedback: comment.data || null,
      status_reviewed_at: now,
      updated_at: now,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  const { error: draftError } = await supabase
    .from("paper_drafts")
    .update(
      decision === "approve"
        ? { status: "published", published_at: now }
        : { status: "revision_required", published_at: null },
    )
    .eq("project_id", id);
  if (draftError) return { ok: false, error: draftError.message };

  const historyError = await logEvent(supabase, {
    project_id: id,
    actor_id: user.id,
    kind: decision === "approve" ? "approved" : "denied",
    body: comment.data || null,
    draft_version: current.version,
    stage: current.stage,
  });

  revalidateProjects(id);
  return historyError ? { ok: false, error: historyError } : { ok: true, id };
}

/** Director comment without a decision. */
export async function addProjectComment(
  id: string,
  body: unknown,
): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user || !(await isDirector(user))) {
    return { ok: false, error: "Only directors can comment." };
  }

  const comment = parseReviewComment(body, true);
  if (!comment.ok) return { ok: false, error: comment.error };

  const supabase = await createClient();
  const { data: draft } = await supabase
    .from("paper_drafts")
    .select("version, stage")
    .eq("project_id", id)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("project_review_events").insert({
    project_id: id,
    actor_id: user.id,
    kind: "comment",
    body: comment.data,
    draft_version: draft?.version ?? null,
    stage: draft?.stage ?? null,
  });
  if (error) return { ok: false, error: error.message };

  revalidateProjects(id);
  return { ok: true, id };
}

/** Director reopens a published project so the team can edit and re-upload. */
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

  const { error: draftError } = await supabase
    .from("paper_drafts")
    .update({ status: "under_review", published_at: null })
    .eq("project_id", id);
  if (draftError) return { ok: false, error: draftError.message };

  const historyError = await logEvent(supabase, {
    project_id: id,
    actor_id: user.id,
    kind: "reopened",
  });

  revalidateProjects(id);
  return historyError ? { ok: false, error: historyError } : { ok: true, id };
}
