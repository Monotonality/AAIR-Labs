"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { reopenProject, reviewProject } from "@/lib/actions/projects";
import { ProposalStatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/dates";
import { proposalCategoryLabel } from "@/lib/proposal-categories";
import { authorNames } from "@/lib/papers";
import type { Project, ProposalStatus } from "@/lib/types";

const STATUS_ORDER: Record<ProposalStatus, number> = {
  pending: 0,
  rejected: 1,
  revision_requested: 2,
  approved: 3,
};

export function ProjectsManager({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      projects.map((project) => [project.id, project.director_feedback ?? ""]),
    ),
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(
    id: string,
    work: () => Promise<{ ok: boolean; error?: string }>,
  ) {
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      const result = await work();
      if (!result.ok) setError(result.error ?? "Something went wrong.");
      setBusyId(null);
      router.refresh();
    });
  }

  if (projects.length === 0) {
    return (
      <div className="border border-dashed border-line bg-surface px-6 py-16 text-center">
        <p className="font-serif text-2xl text-ink">No projects yet</p>
        <p className="mt-2 text-sm text-ink-70">
          Create a project from the projects page, then upload a working paper
          for review here.
        </p>
      </div>
    );
  }

  const ordered = [...projects].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive">{error}</Alert>}

      <ul className="space-y-4">
        {ordered.map((project) => {
          const busy = isPending && busyId === project.id;
          const hasDraft = Boolean(project.draft?.pdf_storage_path);

          return (
            <li key={project.id} className="border border-line bg-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-45">
                    {proposalCategoryLabel(project.category)}
                  </p>
                  <h2 className="mt-1 font-serif text-2xl leading-tight">
                    <Link
                      href={`/projects/${project.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {project.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-ink-70">{authorNames(project)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {hasDraft ? (
                    <Badge
                      variant="outline"
                      className="rounded-[2px] uppercase"
                    >
                      PDF v{project.draft?.version}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="rounded-[2px] border-orange bg-orange-tint text-orange uppercase"
                    >
                      No PDF
                    </Badge>
                  )}
                  <ProposalStatusBadge status={project.status} />
                </div>
              </div>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-70">
                {project.abstract}
              </p>

              <div className="mt-5 space-y-1.5">
                <label
                  htmlFor={`feedback-${project.id}`}
                  className="text-sm leading-none font-medium"
                >
                  Feedback for the team
                </label>
                <Textarea
                  id={`feedback-${project.id}`}
                  rows={3}
                  value={feedback[project.id] ?? ""}
                  onChange={(e) =>
                    setFeedback((prev) => ({
                      ...prev,
                      [project.id]: e.target.value,
                    }))
                  }
                  placeholder="What is complete, what is missing, and what to change before resubmitting."
                  maxLength={2000}
                  disabled={busy}
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                <Button
                  size="sm"
                  disabled={busy || project.status === "approved" || !hasDraft}
                  onClick={() =>
                    run(project.id, () =>
                      reviewProject(project.id, "approve", feedback[project.id]),
                    )
                  }
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busy || project.status === "rejected"}
                  onClick={() =>
                    run(project.id, () =>
                      reviewProject(project.id, "deny", feedback[project.id]),
                    )
                  }
                >
                  Deny
                </Button>
                {project.status === "approved" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => run(project.id, () => reopenProject(project.id))}
                  >
                    Reopen
                  </Button>
                )}
                <Link
                  href={`/projects/${project.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-ink hover:underline underline-offset-4"
                >
                  Open project
                  <ArrowUpRight className="size-3.5" />
                </Link>
                <span className="ml-auto text-xs text-ink-45">
                  {project.status_reviewed_at
                    ? `Reviewed ${formatDate(project.status_reviewed_at)}`
                    : `Updated ${formatDate(project.updated_at)}`}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
