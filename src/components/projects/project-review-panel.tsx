"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  addProjectComment,
  reopenProject,
  reviewProject,
} from "@/lib/actions/projects";
import { ProposalStatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/dates";
import type { Project } from "@/lib/types";

interface ProjectReviewPanelProps {
  project: Pick<Project, "id" | "status" | "status_reviewed_at">;
  hasDraft: boolean;
}

/** Director-only: approve (publish), deny with a reason, or comment. */
export function ProjectReviewPanel({ project, hasDraft }: ProjectReviewPanelProps) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(action: string, work: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    setPendingAction(action);
    startTransition(async () => {
      const result = await work();
      if (result.ok) {
        setComment("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
      setPendingAction(null);
      router.refresh();
    });
  }

  const reviewed = formatDate(project.status_reviewed_at);
  const published = project.status === "approved";
  const hasComment = comment.trim().length > 0;

  return (
    <section className="space-y-4 border border-ink bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-45">
            Director review
          </p>
          <h2 className="font-serif text-2xl">
            {published ? "Published paper" : "Approve or deny the current PDF"}
          </h2>
        </div>
        <ProposalStatusBadge status={project.status} />
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      {!hasDraft && (
        <p className="text-sm leading-relaxed text-orange">
          No PDF has been submitted yet. You can still leave comments.
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="project-comment" className="text-sm leading-none font-medium">
          Comment
        </label>
        <Textarea
          id="project-comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What is complete, what is missing, and what to change. Required when denying."
          maxLength={2000}
          disabled={isPending}
        />
        <p className="text-xs text-ink-45">
          Every decision and comment is saved to the review history, which
          members can see.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <Button
          size="sm"
          disabled={isPending || published || !hasDraft}
          onClick={() => run("approve", () => reviewProject(project.id, "approve", comment))}
        >
          {pendingAction === "approve" ? "Publishing..." : "Approve and publish"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={isPending || project.status !== "pending" || !hasDraft || !hasComment}
          title={hasComment ? undefined : "Write a reason for the denial first."}
          onClick={() => run("deny", () => reviewProject(project.id, "deny", comment))}
        >
          {pendingAction === "deny" ? "Denying..." : "Deny"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={isPending || !hasComment}
          onClick={() => run("comment", () => addProjectComment(project.id, comment))}
        >
          {pendingAction === "comment" ? "Posting..." : "Comment only"}
        </Button>
        {published && (
          <Button
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={() => run("reopen", () => reopenProject(project.id))}
          >
            {pendingAction === "reopen" ? "Reopening..." : "Reopen for changes"}
          </Button>
        )}
        <span className="ml-auto text-xs text-ink-45">
          {reviewed ? `Last decision ${reviewed}` : "No decision yet"}
        </span>
      </div>
    </section>
  );
}
