"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileDown, Upload } from "lucide-react";

import { uploadWorkingPaper } from "@/lib/actions/projects";
import { PaperStatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/dates";
import { DRAFT_STAGES, draftStageLabel, paperPdfUrl } from "@/lib/papers";
import type { DraftStage, Project } from "@/lib/types";

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-line bg-paper px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20";

interface WorkingPaperPanelProps {
  project: Project;
  canEdit: boolean;
  /** Where the lead or a director goes to upload, shown on read-only views. */
  manageHref?: string;
}

export function WorkingPaperPanel({ project, canEdit, manageHref }: WorkingPaperPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const draft = project.draft;
  const locked = project.status === "approved";
  const uploadAllowed = canEdit && !locked;
  const stageLabel = draftStageLabel(draft?.stage);
  const defaultStage: DraftStage = draft?.stage ?? (draft ? "working_paper" : "whitepaper");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setError(null);
    startTransition(async () => {
      const result = await uploadWorkingPaper(project.id, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      form.reset();
      router.refresh();
    });
  }

  return (
    <section className="rounded-[2px] border border-line bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-45">
            Current paper
          </p>
          <h2 className="mt-1 font-serif text-2xl">
            {draft
              ? `${stageLabel ?? "Working paper"} · v${draft.version}`
              : "Nothing submitted yet"}
          </h2>
        </div>
        {draft && <PaperStatusBadge status={draft.status} />}
      </div>

      {error && (
        <div className="mt-4">
          <Alert variant="destructive">{error}</Alert>
        </div>
      )}

      {draft?.pdf_storage_path ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-70">
          <span>Submitted {formatDate(draft.updated_at || draft.created_at)}</span>
          <a
            href={paperPdfUrl(project.id, draft.version)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-ink hover:underline underline-offset-4"
          >
            <FileDown className="size-4" />
            View PDF
          </a>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-ink-70">
          No PDF has been submitted for this project yet. A director reviews
          each submission, and approving one publishes it.
        </p>
      )}

      {draft?.pdf_storage_path && (
        <p className="mt-2 text-xs text-ink-45">
          Only the newest PDF is kept. Each upload deletes the previous file;
          the review history keeps a record of every submission.
        </p>
      )}

      {uploadAllowed && (
        <form
          onSubmit={onSubmit}
          className="mt-5 grid grid-cols-1 gap-3 border-t border-line pt-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <div className="space-y-1.5">
            <label htmlFor="working-paper-stage" className="text-sm leading-none font-medium">
              This paper is a
            </label>
            <select
              id="working-paper-stage"
              name="stage"
              defaultValue={defaultStage}
              disabled={isPending}
              className={SELECT_CLASS}
            >
              {DRAFT_STAGES.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="working-paper-file" className="text-sm leading-none font-medium">
              PDF (20MB max)
            </label>
            <Input
              id="working-paper-file"
              name="file"
              type="file"
              accept="application/pdf"
              required
              disabled={isPending}
              className="h-9"
            />
          </div>
          <Button type="submit" size="sm" disabled={isPending}>
            <Upload className="size-4" />
            {isPending ? "Submitting..." : "Submit for review"}
          </Button>
        </form>
      )}

      {locked && canEdit && (
        <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-ink-70">
          This paper is published, so the project is locked. A director can
          reopen it to allow edits and new submissions.
        </p>
      )}

      {!canEdit && manageHref && !locked && (
        <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-ink-70">
          <Link href={manageHref} className="font-semibold text-ink underline underline-offset-4">
            Manage this project
          </Link>{" "}
          to submit a new PDF or edit the details.
        </p>
      )}
    </section>
  );
}
