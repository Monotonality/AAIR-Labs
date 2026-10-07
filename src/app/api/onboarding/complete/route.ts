import { NextResponse } from "next/server";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** The wizard sends a graduation year (e.g. "2027"); the column is a date. */
function normalizeGraduation(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const v = value.trim();
  if (/^\d{4}$/.test(v)) return `${v}-01-01`;
  return v;
}

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

  const userId = user.id;
  const body = await request.json();

  const fullName = String(
    body.fullName ?? user.user_metadata?.full_name ?? "",
  ).trim();
  const email = String(body.email ?? user.email ?? "").trim();
  const personalEmail = String(body.personalEmail ?? "").trim() || null;
  const major = String(body.major ?? "").trim() || null;
  const expectedGradDate = normalizeGraduation(
    body.expectedGradDate ?? body.expectedGraduation,
  );
  const bio = String(body.bio ?? "").trim() || null;

  // The wizard has no username field, so derive one from the name or email.
  const usernameSlug = slugify(
    body.username || fullName || email.split("@")[0] || "",
  );

  if (!usernameSlug) {
    return NextResponse.json(
      { error: "A valid username is required." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { error: applicationError } = await supabase.from("applications").insert({
    profile_id: userId,
    form_data: {
      fullName,
      email,
      personalEmail,
      major,
      expectedGradDate,
      bio,
    },
    status: "pending",
  });

  if (applicationError) {
    return NextResponse.json(
      { error: applicationError.message },
      { status: 500 },
    );
  }

  async function apply(slug: string) {
    return supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          full_name: fullName || null,
          username: slug,
          email: email || null,
          major,
          expected_grad_date: expectedGradDate,
          bio,
          onboarding_completed: true,
        },
        { onConflict: "id" },
      )
      .select()
      .maybeSingle();
  }

  let { error, data } = await apply(usernameSlug);

  if (error?.code === "23505") {
    ({ error, data } = await apply(
      `${usernameSlug}-${Math.random().toString(36).slice(2, 6)}`,
    ));
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    profile: data,
    username: (data as { username?: string } | null)?.username,
  });
}
