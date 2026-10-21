"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { reopenProject, reviewProject } from "@/lib/actions/projects";
import { ProposalStatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/dates";
import type { Project } from "@/lib/types";

interface ProjectReviewPanelProps {
  project: Pick<Project, "id" | "status" | "director_feedback" | "status_reviewed_at">;
  hasDraft: boolean;
}

export function ProjectReviewPanel({ project, hasDraft }: ProjectReviewPanelProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState(project.director_feedback ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(action: string, work: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    setPendingAction(action);
    startTransition(async () => {
      const result = await work();
      if (!result.ok) setError(result.error ?? "Something went wrong.");
      setPendingAction(null);
      router.refresh();
    });
  }

  const reviewed = formatDate(project.status_reviewed_at);

  return (
    <section className="space-y-4 border border-ink bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-45">
            Director review
          </p>
          <h2 className="font-serif text-2xl">
            {project.status === "approved" ? "Approved project" : "Approve or deny"}
          </h2>
        </div>
        <ProposalStatusBadge status={project.status} />
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      {!hasDraft && (
        <p className="text-sm leading-relaxed text-orange">
          No working paper uploaded yet — a PDF is required before this project
          can be approved.
        </p>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="project-feedback"
          className="text-sm leading-none font-medium"
        >
          Feedback for the team
        </label>
        <Textarea
          id="project-feedback"
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="What is complete, what is missing, and what to change before resubmitting."
          maxLength={2000}
          disabled={isPending}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <Button
          size="sm"
          disabled={isPending || project.status === "approved" || !hasDraft}
          onClick={() =>
            run("approve", () => reviewProject(project.id, "approve", feedback))
          }
        >
          {pendingAction === "approve" ? "Approving..." : "Approve"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={isPending || project.status === "rejected"}
          onClick={() =>
            run("deny", () => reviewProject(project.id, "deny", feedback))
          }
        >
          {pendingAction === "deny" ? "Denying..." : "Deny"}
        </Button>
        {project.status === "approved" && (
          <Button
            size="sm"
            variant="secondary"
            disabled={isPending}
            onClick={() => run("reopen", () => reopenProject(project.id))}
          >
            {pendingAction === "reopen" ? "Reopening..." : "Reopen for changes"}
          </Button>
        )}
        <span className="ml-auto text-xs text-ink-45">
          {reviewed ? `Last reviewed ${reviewed}` : "Not reviewed yet"}
        </span>
      </div>
    </section>
  );
}
