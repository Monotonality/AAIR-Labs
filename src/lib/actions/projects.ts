"use server";

import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";

import { getAuthenticatedUser, isDirector } from "@/lib/auth-helpers";
import { DRAFT_STAGE_VALUES, PAPER_BUCKET, paperStorageKey } from "@/lib/papers";
import { createServiceClient, hasServiceRoleEnv } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { DraftStage, ProposalReviewDecision } from "@/lib/types";
import {
  parseProjectCreate,
  parseProjectDetails,
  parseProjectMembers,
  parseReviewComment,
  parseTagList,
} from "@/lib/validation/projects";

const MAX_BYTES = 20 * 1024 * 1024; // 20MB, matches the bucket limit.

type ActionResult = { ok: true; id: string } | { ok: false; error: string };

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
 * Delete every stored PDF for the project except `keepPath`: the project's own
 * folder plus any legacy `<user>/<project>/…` folders its drafts pointed at.
 * Best effort; a failure leaves an orphan file but never breaks the upload.
 */
async function removeOldPaperFiles(projectId: string, keepPath: string, oldPaths: string[]) {
  if (!hasServiceRoleEnv()) return;
  try {
    const bucket = createServiceClient().storage.from(PAPER_BUCKET);

    const doomed = new Set<string>();
    const folders = new Set<string>([projectId]);
    for (const raw of oldPaths) {
      const key = paperStorageKey(raw);
      if (key !== keepPath) doomed.add(key);
      const dir = key.split("/").slice(0, -1);
      if (dir.includes(projectId)) folders.add(dir.join("/"));
    }

    for (const folder of folders) {
      const { data } = await bucket.list(folder, { limit: 1000 });
      for (const item of data ?? []) {
        if (!item.id) continue; // sub-folder
        const name = `${folder}/${item.name}`;
        if (name !== keepPath) doomed.add(name);
      }
    }

    if (doomed.size > 0) {
      const { error } = await bucket.remove([...doomed]);
      if (error) console.error("Could not remove old paper files", projectId, error.message);
    }
  } catch (error) {
    console.error("Could not remove old paper files", projectId, error);
  }
}

/**
 * The lead or a director submits a PDF. The file goes to a new object, then
 * one database call records the new version, moves a denied project back to
 * pending, and logs the submission. Only after that succeeds are the older
 * files deleted, so a failure never leaves the project pointing at nothing.
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

  const { data: drafts, error: draftError } = await supabase
    .from("paper_drafts")
    .select("pdf_storage_path")
    .eq("project_id", id);
  if (draftError) return { ok: false, error: draftError.message };
  const oldPaths = (drafts ?? [])
    .map((row) => row.pdf_storage_path as string | null)
    .filter((path): path is string => Boolean(path));

  const bytes = new Uint8Array(await file.arrayBuffer());
  const storagePath = `${id}/${crypto.randomUUID()}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from(PAPER_BUCKET)
    .upload(storagePath, bytes, { contentType: "application/pdf", upsert: false });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { error: submitError } = await supabase.rpc("submit_project_draft", {
    p_project_id: id,
    p_stage: stage,
    p_path: storagePath,
  });
  if (submitError) {
    await supabase.storage.from(PAPER_BUCKET).remove([storagePath]);
    return { ok: false, error: submitError.message };
  }

  await removeOldPaperFiles(id, storagePath, oldPaths);

  revalidateProjects(id);
  return { ok: true, id };
}

/**
 * Director approve/deny of the current PDF. Approving publishes the paper
 * (library + researcher profiles); denying requires a reason. Runs as one
 * database transaction.
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
  const { error } = await supabase.rpc("review_project", {
    p_project_id: id,
    p_decision: decision,
    p_body: comment.data,
  });
  if (error) return { ok: false, error: error.message };

  revalidateProjects(id);
  return { ok: true, id };
}

/** Director comment without a decision. The database sets the timestamp. */
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
  const { error } = await supabase.rpc("reopen_project", { p_project_id: id });
  if (error) return { ok: false, error: error.message };

  revalidateProjects(id);
  return { ok: true, id };
}
