import { NextResponse } from "next/server";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import {
  getAuthenticatedUser,
  isDirector,
} from "@/lib/auth-helpers";
import type {
  ProposalReviewAction,
  ProposalStatus,
} from "@/lib/types";
import type { PaperStatus } from "@/lib/types";


const STATUS_MAP: Record<ProposalReviewAction, ProposalStatus> = {
  approved: "approved",
  rejected: "rejected",
  revision_requested: "revision_requested",
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase is not configured on this environment." },
      { status: 500 },
    );
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!(await isDirector(user))) {
    return NextResponse.json(
      { error: "Only directors can review proposals." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const body = await request.json();
  const { action, feedback }: { action: ProposalReviewAction; feedback: string } =
    body;

  if (!(action in STATUS_MAP)) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const supabase = await createClient();
  const next = STATUS_MAP[action];

  const updates: Record<string, string> = {
    status: next,
    director_feedback: feedback ?? "",
  };

  if (action === "approved") {
    updates.status_reviewed_at = new Date().toISOString();
  }

  const { error, data } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const responseBody: { project: typeof data; paperDraftCreated?: boolean } = {
    project: data,
  };

  // On approval, seed the author's first paper draft row so they can upload.
  if (action === "approved" && data?.author_id) {
    const { data: existing } = await supabase
      .from("paper_drafts")
      .select("id")
      .eq("project_id", id)
      .maybeSingle();
    if (!existing) {
      const status: PaperStatus = "draft";
      const { error: draftError } = await supabase.from("paper_drafts").insert({
        project_id: id,
        version: 1,
        pdf_storage_path: null,
        latex_url: null,
        status,
      });
      if (!draftError) responseBody.paperDraftCreated = true;
    }
  }

  return NextResponse.json(responseBody);
}
