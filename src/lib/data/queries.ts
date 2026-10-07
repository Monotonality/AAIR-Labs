import { cache } from "react";
import type { EventItem, Profile, Project } from "@/lib/types";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { SAMPLE_AUTHORS, SAMPLE_EVENTS, SAMPLE_PAPERS } from "@/lib/data/samples";

export async function getPublishedPapers(): Promise<Project[]> {
  if (!hasSupabaseEnv()) {
    return SAMPLE_PAPERS.map((paper) => ({
      ...paper,
      draft: paper.draft ?? null,
      author: paper.author ?? null,
    }));
  }

  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*, author:profiles(*), draft:paper_drafts(*)")
    .eq("status", "approved")
    .order("updated_at", { ascending: false });

  if (error) return [];

  // Only surface projects that have a published draft.
  return (projects as unknown as Project[]).filter(
    (p) => p.draft?.status === "published",
  );
}

export async function getEvents(): Promise<EventItem[]> {
  if (!hasSupabaseEnv()) {
    return SAMPLE_EVENTS;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) return [];
  return (data as EventItem[]) ?? [];
}

export async function getResearchers(): Promise<Profile[]> {
  if (!hasSupabaseEnv()) {
    return SAMPLE_AUTHORS;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("onboarding_completed", true)
    .order("full_name");

  if (error) return [];
  return (data as Profile[]) ?? [];
}

export const getProfileByUsername = cache(async function getProfileByUsername(
  username: string,
): Promise<{
  profile: Profile | null;
  papers: Project[];
}> {
  if (!hasSupabaseEnv()) {
    const profile =
      SAMPLE_AUTHORS.find((p) => p.username === username) ?? null;
    return {
      profile,
      papers: profile
        ? SAMPLE_PAPERS.filter((p) => p.author_id === profile.id)
        : [],
    };
  }

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error || !profile) {
    return { profile: null, papers: [] };
  }

  const { data: papers } = await supabase
    .from("projects")
    .select("*, author:profiles(*), draft:paper_drafts(*)")
    .eq("author_id", profile.id)
    .eq("status", "approved");

  return {
    profile: profile as Profile,
    papers: (papers as Project[]) ?? [],
  };
});

export async function getProjectById(id: string): Promise<Project | null> {
  if (!hasSupabaseEnv()) {
    return SAMPLE_PAPERS.find((p) => p.id === id) ?? null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*, author:profiles(*), draft:paper_drafts(*)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as Project;
}