import type { Profile, ProfileLink, UserRole } from "@/lib/types";

const ROLE_LABEL: Record<UserRole, string> = {
  student: "Student researcher",
  director: "Director",
  faculty: "Faculty",
  guest: "Guest",
};

export function roleLabel(role: UserRole) {
  return ROLE_LABEL[role] ?? "Member";
}

/** Graduation is stored as a term (e.g. "Fall 2027"); portfolios show the year. */
export function classYear(value: string | null | undefined) {
  if (!value) return null;
  const match = String(value).match(/\d{4}/);
  return match?.[0] ?? null;
}

export const GRAD_SEMESTERS = ["Spring", "Summer", "Fall"] as const;
export type GradSemester = (typeof GRAD_SEMESTERS)[number];

export function gradYearOptions(
  baseYear = new Date().getFullYear(),
  count = 8,
): string[] {
  return Array.from({ length: count }, (_, i) => String(baseYear + i));
}

/** Splits a stored graduation value into a semester and year. */
export function parseGradTerm(value: string | null | undefined): {
  semester: GradSemester;
  year: string;
} {
  const raw = String(value ?? "").trim();

  const term = raw.match(/^(spring|summer|fall)\s+(\d{4})$/i);
  if (term) {
    const semester =
      (term[1][0].toUpperCase() + term[1].slice(1).toLowerCase()) as GradSemester;
    return { semester, year: term[2] };
  }

  // Legacy ISO date (e.g. "2026-01-01").
  const iso = raw.match(/^(\d{4})-(\d{1,2})-\d{1,2}$/);
  if (iso) {
    const month = Number(iso[2]);
    const semester: GradSemester =
      month <= 4 ? "Spring" : month <= 7 ? "Summer" : "Fall";
    return { semester, year: iso[1] };
  }

  const yearOnly = raw.match(/^(\d{4})$/);
  if (yearOnly) return { semester: "Spring", year: yearOnly[1] };

  return { semester: "Spring", year: "" };
}

export function formatGradTerm(semester: string, year: string) {
  const y = year.trim();
  return y ? `${semester} ${y}` : "";
}

/** Human-readable graduation label, tolerant of legacy date values. */
export function gradTermLabel(value: string | null | undefined) {
  const { semester, year } = parseGradTerm(value);
  return year ? `${semester} ${year}` : "";
}

export function profileSubtitle(profile: Profile) {
  const year = classYear(profile.expected_grad_date);
  return [profile.major, year ? `Class of ${year}` : null, roleLabel(profile.role)]
    .filter(Boolean)
    .join(" \u00b7 ");
}

/** Accepts a bare domain or an absolute http(s) URL. Returns null when invalid. */
export function normalizeHttpUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function optionalUrl(
  value: unknown,
  label: string,
): { url: string | null } | { error: string } {
  if (value == null || String(value).trim() === "") return { url: null };
  const url = normalizeHttpUrl(String(value));
  if (!url) return { error: `${label} needs a valid http or https URL.` };
  return { url };
}

export function optionalBio(
  value: unknown,
): { bio: string | null } | { error: string } {
  const bio = String(value ?? "").trim();
  if (bio.length > 2000) {
    return { error: "Bio must be 2,000 characters or fewer." };
  }
  return { bio: bio || null };
}

export function parseExtraLinks(
  value: unknown,
): { links: ProfileLink[] } | { error: string } {
  if (value == null) return { links: [] };
  if (!Array.isArray(value)) return { error: "Links must be a list." };
  if (value.length > 8) return { error: "You can add up to 8 extra links." };

  const links: ProfileLink[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") {
      return { error: "Each link needs a label and a URL." };
    }
    const label = String((item as { label?: unknown }).label ?? "").trim();
    const raw = String((item as { url?: unknown }).url ?? "").trim();
    if (!label && !raw) continue;
    if (!label || label.length > 40) {
      return { error: "Each link needs a label of 40 characters or fewer." };
    }
    const url = normalizeHttpUrl(raw);
    if (!url) return { error: `${label} needs a valid http or https URL.` };
    links.push({ label, url });
  }
  return { links };
}

export type DisplayLink = {
  label: string;
  href: string;
  icon: "linkedin" | "github" | "website" | "link";
};

export function displayLinks(profile: Profile): DisplayLink[] {
  const items: DisplayLink[] = [];
  if (profile.linkedin_url) {
    items.push({
      label: "LinkedIn",
      href: profile.linkedin_url,
      icon: "linkedin",
    });
  }
  if (profile.github_url) {
    items.push({
      label: "GitHub",
      href: profile.github_url,
      icon: "github",
    });
  }
  if (profile.website_url) {
    items.push({
      label: "Website",
      href: profile.website_url,
      icon: "website",
    });
  }
  const extras = Array.isArray(profile.links) ? profile.links : [];
  for (const link of extras) {
    if (!link?.label || !link?.url) continue;
    items.push({ label: link.label, href: link.url, icon: "link" });
  }
  return items;
}
