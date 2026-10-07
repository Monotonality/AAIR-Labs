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

/** Graduation is stored as a date; portfolios show the year. */
export function classYear(value: string | null | undefined) {
  if (!value) return null;
  const match = String(value).match(/\d{4}/);
  return match?.[0] ?? null;
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
