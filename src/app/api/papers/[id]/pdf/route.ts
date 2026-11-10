import { NextResponse } from "next/server";

import { PAPER_BUCKET, paperStorageKey } from "@/lib/papers";
import { createAdminClient, hasServiceRoleEnv } from "@/lib/supabase/admin";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

const SIGNED_URL_SECONDS = 60;
const NO_STORE = { "Cache-Control": "private, no-store" };

/**
 * Serves a project's current PDF from the private bucket. Row-level security
 * on paper_drafts decides access: anyone for published papers; approved
 * members, the team, and directors for work in progress.
 */
export async function GET(request: Request, ctx: RouteContext<"/api/papers/[id]/pdf">) {
  const { id } = await ctx.params;
  if (!hasSupabaseEnv() || !hasServiceRoleEnv()) {
    return new NextResponse("PDF storage is not configured.", { status: 503, headers: NO_STORE });
  }

  const supabase = await createClient();
  const { data: draft, error } = await supabase
    .from("paper_drafts")
    .select("pdf_storage_path")
    .eq("project_id", id)
    .not("pdf_storage_path", "is", null)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !draft?.pdf_storage_path) {
    return new NextResponse("Not found.", { status: 404, headers: NO_STORE });
  }

  // ?download=<filename> asks the browser to save rather than display it.
  const download = new URL(request.url).searchParams.get("download")?.slice(0, 200);

  const admin = await createAdminClient();
  const { data: signed, error: signError } = await admin.storage
    .from(PAPER_BUCKET)
    .createSignedUrl(
      paperStorageKey(draft.pdf_storage_path),
      SIGNED_URL_SECONDS,
      download ? { download } : undefined,
    );

  if (signError || !signed?.signedUrl) {
    return new NextResponse("Not found.", { status: 404, headers: NO_STORE });
  }

  return NextResponse.redirect(signed.signedUrl, { status: 302, headers: NO_STORE });
}
