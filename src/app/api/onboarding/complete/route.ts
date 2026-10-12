import { NextResponse } from "next/server";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { isApprovedMember } from "@/lib/data/queries";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Normalizes a graduation value to a term such as "Fall 2027". */
function normalizeGradTerm(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const v = value.trim();

  const term = v.match(/^(spring|summer|fall)\s+(\d{4})$/i);
  if (term) {
    const semester = term[1][0].toUpperCase() + term[1].slice(1).toLowerCase();
    return `${semester} ${term[2]}`;
  }

  const iso = v.match(/^(\d{4})-(\d{1,2})-\d{1,2}$/);
  if (iso) {
    const month = Number(iso[2]);
    const semester = month <= 4 ? "Spring" : month <= 7 ? "Summer" : "Fall";
    return `${semester} ${iso[1]}`;
  }

  const yearOnly = v.match(/^(\d{4})$/);
  if (yearOnly) return `Spring ${yearOnly[1]}`;

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
  if (await isApprovedMember(userId)) {
    return NextResponse.json(
      { error: "You are already an approved member." },
      { status: 409 },
    );
  }

  const body = await request.json();

  const fullName = String(
    body.fullName ?? user.user_metadata?.full_name ?? "",
  ).trim();
  const email = String(body.email ?? user.email ?? "").trim();
  const personalEmail = String(body.personalEmail ?? "").trim() || null;
  const major = String(body.major ?? "").trim() || null;
  const expectedGradDate = normalizeGradTerm(
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

  const university = String(body.university ?? "").trim() || null;
  const { error: applicationError } = await supabase.from("applications").insert({
    profile_id: userId,
    form_data: {
      fullName,
      email,
      personalEmail,
      major,
      expectedGradDate,
      university,
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
