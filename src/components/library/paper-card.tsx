import Link from "next/link";
import { PaperStatusBadge } from "@/components/shared/status-badge";
import { authorNames } from "@/lib/papers";
import { proposalCategoryLabel } from "@/lib/proposal-categories";
import type { Project } from "@/lib/types";

const PAPER_BUCKET = "research-papers";

export function paperStorageUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return path;
  const trimmed = path.replace(/^\/+/, "");
  const key = trimmed.startsWith(`${PAPER_BUCKET}/`)
    ? trimmed.slice(PAPER_BUCKET.length + 1)
    : trimmed;
  const encoded = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/storage/v1/object/public/${PAPER_BUCKET}/${encoded}`;
}

export function paperPreviewUrl(path: string) {
  return paperStorageUrl(path.replace(/\.pdf$/i, "-preview.jpg"));
}

interface PaperCardProps {
  project: Project;
  statusLabel?: string;
}

export function PaperCard({ project, statusLabel }: PaperCardProps) {
  const authors = authorNames(project);

  return (
    <article className="card flex flex-col gap-3 rounded-[2px] border border-line bg-surface p-5 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-ink">
      {(statusLabel || project.draft?.status === "published") && (
        <div className="flex items-start justify-between gap-3">
          {statusLabel ? (
            <span className="rounded-[2px] border border-ink bg-ink px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-paper">
              {statusLabel}
            </span>
          ) : (
            <PaperStatusBadge status="published" />
          )}
        </div>
      )}
      <h4 className="font-serif text-xl leading-tight">{project.title}</h4>
      <p className="line-clamp-3 text-[13.5px] leading-relaxed text-ink-70">
        {project.abstract}
      </p>
      <div className="flex flex-wrap gap-4 text-[11.5px] font-semibold uppercase tracking-wider text-ink-45">
        {project.target_domain && <span>{project.target_domain}</span>}
        {authors && <span>{authors}</span>}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
        <span className="text-xs text-ink-45">
          {proposalCategoryLabel(project.category)} · PDF
        </span>
        <Link
          href={`/library/${project.id}`}
          className="border-b-[1.5px] border-ink pb-0.5 text-[13px] font-semibold text-ink transition-colors hover:border-green hover:text-green"
        >
          Read &rarr;
        </Link>
      </div>
    </article>
  );
}