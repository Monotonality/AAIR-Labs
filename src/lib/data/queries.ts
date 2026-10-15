import { cache } from "react";
import type {
  Application,
  EventItem,
  ExternalReading,
  PaperDraft,
  Profile,
  Project,
} from "@/lib/types";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { SAMPLE_AUTHORS, SAMPLE_EVENTS, SAMPLE_PAPERS } from "@/lib/data/samples";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const PAPER_SELECT =
  "*, author:profiles(*), draft:paper_drafts(*), co_authors:project_authors(*, profile:profiles(*))";

/**
 * PostgREST embeds the to-many `paper_drafts` relation as an array. Collapse it
 * to the single most relevant draft (a published one if present, else newest).
 */
function normalizeProject(row: unknown): Project {
  const project = row as Project & {
    draft?: PaperDraft | PaperDraft[] | null;
  };
  const drafts = Array.isArray(project.draft)
    ? project.draft
    : project.draft
      ? [project.draft]
      : [];
  const draft =
    drafts.find((candidate) => candidate.status === "published") ??
    [...drafts].sort((a, b) => b.version - a.version)[0] ??
    null;
  return { ...project, draft };
}

/** Papers a member authored or co-authored, newest first. */
async function loadProfilePapers(
  supabase: SupabaseServerClient,
  profileId: string,
): Promise<Project[]> {
  const [authored, coauthored] = await Promise.all([
    supabase.from("projects").select(PAPER_SELECT).eq("author_id", profileId),
    supabase
      .from("project_authors")
      .select(`project:projects(${PAPER_SELECT})`)
      .eq("profile_id", profileId),
  ]);

  const map = new Map<string, Project>();
  for (const paper of (authored.data as unknown as unknown[] | null) ?? []) {
    const project = normalizeProject(paper);
    map.set(project.id, project);
  }
  for (const row of (coauthored.data as unknown as
    | { project: unknown | null }[]
    | null) ?? []) {
    if (row.project) {
      const project = normalizeProject(row.project);
      map.set(project.id, project);
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
  );
}

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
    .select(PAPER_SELECT)
    .eq("status", "approved")
    .order("updated_at", { ascending: false });

  if (error) return [];

  // Only surface projects that have a published draft.
  return (projects as unknown as unknown[])
    .map(normalizeProject)
    .filter((p) => p.draft?.status === "published");
}

/**
 * Everything shown in the public library: published papers plus working papers
 * (which are public-by-design even before they are published).
 */
export async function getLibraryPapers(): Promise<Project[]> {
  if (!hasSupabaseEnv()) {
    return SAMPLE_PAPERS.map((paper) => ({
      ...paper,
      draft: paper.draft ?? null,
      author: paper.author ?? null,
    }));
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(PAPER_SELECT)
    .order("updated_at", { ascending: false });

  if (error) return [];

  return (data as unknown as unknown[])
    .map(normalizeProject)
    .filter(
      (p) =>
        p.draft?.status === "published" ||
        (p.document_type === "working_paper" && Boolean(p.draft)),
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

export async function getExternalReadings(): Promise<ExternalReading[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("external_readings")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return [];
  return (data as ExternalReading[]) ?? [];
}

/** True when onboarding is finished and a director has approved membership. */
export async function isApprovedMember(profileId: string): Promise<boolean> {
  if (!hasSupabaseEnv()) return false;

  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", profileId)
    .maybeSingle();

  if (profileError || !profile?.onboarding_completed) return false;

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select("id")
    .eq("profile_id", profileId)
    .eq("status", "approved")
    .limit(1)
    .maybeSingle();

  if (applicationError) return false;
  return Boolean(application);
}

export async function getApplications(): Promise<Application[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select("*, applicant:profiles(*)")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as Application[]) ?? [];
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

/** Every profile, newest first. Directors use this on the members page. */
export async function getMembers(): Promise<Profile[]> {
  if (!hasSupabaseEnv()) {
    return SAMPLE_AUTHORS;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

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

  const papers = await loadProfilePapers(supabase, profile.id);

  return {
    profile: profile as Profile,
    papers,
  };
});

export const getProfileById = cache(async function getProfileById(
  id: string,
): Promise<{
  profile: Profile | null;
  papers: Project[];
}> {
  if (!hasSupabaseEnv()) {
    const profile = SAMPLE_AUTHORS.find((p) => p.id === id) ?? null;
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
    .eq("id", id)
    .maybeSingle();

  if (error || !profile) {
    return { profile: null, papers: [] };
  }

  const papers = await loadProfilePapers(supabase, profile.id);

  return {
    profile: profile as Profile,
    papers,
  };
});

export async function getProjectById(id: string): Promise<Project | null> {
  if (!hasSupabaseEnv()) {
    return SAMPLE_PAPERS.find((p) => p.id === id) ?? null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(PAPER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return normalizeProject(data);
}