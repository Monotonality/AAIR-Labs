import { NextResponse } from "next/server";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";


const MAX_BYTES = 20 * 1024 * 1024; // 20MB, matches bucket limit.

export async function POST(request: Request) {
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

  const formData = await request.formData();
  const projectId = String(formData.get("projectId") ?? "");
  const file = formData.get("file");

  if (!projectId || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Project id and a PDF file are required." },
      { status: 400 },
    );
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF files are accepted." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "PDF must be 20MB or smaller." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // Confirm the user owns the project.
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("author_id", user.id)
    .maybeSingle();
  if (!project) {
    return NextResponse.json(
      { error: "Project not found or not yours." },
      { status: 404 },
    );
  }

  // Next version number for this project's drafts.
  const { count } = await supabase
    .from("paper_drafts")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  const version = (count ?? 0) + 1;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const storagePath = `${user.id}/${projectId}/v${version}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("research-papers")
    .upload(storagePath, bytes, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: uploadError.message },
      { status: 500 },
    );
  }

  const { error, data } = await supabase
    .from("paper_drafts")
    .insert({
      project_id: projectId,
      version,
      pdf_storage_path: storagePath,
      latex_url: null,
      status: "under_review",
    })
    .select()
    .single();

  if (error) {
    // Roll back the orphaned object.
    await supabase.storage.from("research-papers").remove([storagePath]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ draft: data }, { status: 201 });
}
