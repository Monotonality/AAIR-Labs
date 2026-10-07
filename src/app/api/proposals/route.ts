import { NextResponse } from "next/server";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";


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

  const body = await request.json();
  const { title, abstract, targetDomain } = body;

  if (!title || !abstract) {
    return NextResponse.json(
      { error: "Title and abstract are required." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error, data } = await supabase
    .from("projects")
    .insert({
      author_id: user.id,
      title,
      abstract,
      target_domain: targetDomain ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data }, { status: 201 });
}
