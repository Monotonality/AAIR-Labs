import type {
  DocumentType,
  Profile,
  Project,
  ProjectAuthorRole,
} from "@/lib/types";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  research_paper: "Research Paper",
  working_paper: "Working Paper",
  whitepaper: "Whitepaper",
  technical_framework: "Technical Framework",
  project_status_paper: "Project Status Paper",
  other: "Other",
};

export function documentTypeLabel(type: DocumentType | null | undefined) {
  return (type && DOCUMENT_TYPE_LABELS[type]) || "Research Paper";
}

export interface ProjectAuthorEntry {
  profile: Profile;
  role: ProjectAuthorRole;
}

/**
 * Ordered, de-duplicated (co-)author list for a project. Falls back to the
 * single `author` join when no rows are joined from `project_authors`.
 */
export function projectAuthors(project: Project): ProjectAuthorEntry[] {
  const rows = [...(project.co_authors ?? [])].sort(
    (a, b) => a.position - b.position,
  );

  const entries: ProjectAuthorEntry[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row.profile || seen.has(row.profile_id)) continue;
    seen.add(row.profile_id);
    entries.push({ profile: row.profile, role: row.role });
  }

  if (entries.length === 0 && project.author) {
    entries.push({ profile: project.author, role: "author" });
  }
  return entries;
}

export function authorNameList(project: Project) {
  return projectAuthors(project).map((entry) => entry.profile.full_name);
}

export function authorNames(project: Project) {
  return authorNameList(project).join(", ");
}
