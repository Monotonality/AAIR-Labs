import { NextResponse } from "next/server";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { optionalBio, optionalUrl, parseExtraLinks } from "@/lib/profile";

export async function PATCH(request: Request) {
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

  const bio = optionalBio(body.bio);
  if ("error" in bio) {
    return NextResponse.json({ error: bio.error }, { status: 400 });
  }

  const github = optionalUrl(body.githubUrl, "GitHub");
  if ("error" in github) {
    return NextResponse.json({ error: github.error }, { status: 400 });
  }

  const linkedin = optionalUrl(body.linkedinUrl, "LinkedIn");
  if ("error" in linkedin) {
    return NextResponse.json({ error: linkedin.error }, { status: 400 });
  }

  const website = optionalUrl(body.websiteUrl, "Website");
  if ("error" in website) {
    return NextResponse.json({ error: website.error }, { status: 400 });
  }

  const links = parseExtraLinks(body.links);
  if ("error" in links) {
    return NextResponse.json({ error: links.error }, { status: 400 });
  }

  const supabase = await createClient();
  const { error, data } = await supabase
    .from("profiles")
    .update({
      bio: bio.bio,
      github_url: github.url,
      linkedin_url: linkedin.url,
      website_url: website.url,
      links: links.links,
    })
    .eq("id", user.id)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
