import Link from "next/link";
import { FileText, Globe } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/social-icons";
import { classYear } from "@/lib/profile";
import type { Profile } from "@/lib/types";

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function ResearcherCard({ profile }: { profile: Profile }) {
  const year = classYear(profile.expected_grad_date);

  return (
    <article className="flex flex-col gap-3 rounded-[2px] border border-line bg-surface p-5 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-ink">
      <div className="flex items-center gap-3.5">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="size-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink font-serif text-lg text-paper">
            {initials(profile.full_name)}
          </span>
        )}
        <div>
          <h4 className="font-serif text-lg leading-tight">
            {profile.full_name}
          </h4>
          {profile.title && (
            <p className="text-sm text-ink-70">{profile.title}</p>
          )}
          <p className="text-[11.5px] font-semibold uppercase tracking-wider text-ink-45">
            {profile.major}
            {year ? ` · ${year}` : ""}
          </p>
        </div>
      </div>

      {profile.bio && (
        <p className="line-clamp-3 text-[13px] leading-relaxed text-ink-70">
          {profile.bio}
        </p>
      )}

      {profile.research_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.research_tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] font-semibold text-ink-70"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
        <div className="flex items-center gap-2">
          {profile.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-ink-70 transition-colors hover:text-ink"
            >
              <GitHubIcon className="size-4" />
            </a>
          )}
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-ink-70 transition-colors hover:text-ink"
            >
              <LinkedInIcon className="size-4" />
            </a>
          )}
          {profile.website_url && (
            <a
              href={profile.website_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website"
              className="text-ink-70 transition-colors hover:text-ink"
            >
              <Globe className="size-4" />
            </a>
          )}
        </div>
        <Link
          href={`/researchers/${profile.username}`}
          className="inline-flex items-center gap-1.5 border-b-[1.5px] border-ink pb-0.5 text-[13px] font-semibold text-ink transition-colors hover:border-green hover:text-green"
        >
          <FileText className="size-3.5" />
          Portfolio
        </Link>
      </div>
    </article>
  );
}