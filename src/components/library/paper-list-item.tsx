import Link from "next/link";

import { authorNames } from "@/lib/papers";
import { proposalCategoryLabel } from "@/lib/proposal-categories";
import type { Project } from "@/lib/types";

function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function PaperListItem({ project }: { project: Project }) {
  const authors = authorNames(project);
  const category = proposalCategoryLabel(project.category);
  const meta = [authors, category, project.target_domain]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="border-b border-line first:border-t">
      <Link
        href={`/library/${project.id}`}
        className="group flex items-start justify-between gap-6 py-4"
      >
        <div className="min-w-0">
          <p className="font-serif text-lg leading-tight text-ink transition-colors group-hover:text-green">
            {project.title}
          </p>
          {meta && <p className="mt-1 text-[12.5px] text-ink-45">{meta}</p>}
        </div>
        <span className="shrink-0 pt-1 text-[11px] font-semibold uppercase tracking-wider text-ink-45">
          {formatDate(project.draft?.created_at ?? project.created_at)}
        </span>
      </Link>
    </li>
  );
}
