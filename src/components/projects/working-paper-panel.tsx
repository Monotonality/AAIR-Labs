"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileDown, Upload } from "lucide-react";

import { uploadWorkingPaper } from "@/lib/actions/projects";
import { paperStorageUrl } from "@/components/library/paper-card";
import { PaperStatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/dates";
import type { Project } from "@/lib/types";

interface WorkingPaperPanelProps {
  project: Project;
  canEdit: boolean;
}

export function WorkingPaperPanel({ project, canEdit }: WorkingPaperPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const draft = project.draft;
  const locked = project.status === "approved";
  const uploadAllowed = canEdit && !locked;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await uploadWorkingPaper(project.id, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="rounded-[2px] border border-line bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-45">
            Working paper
          </p>
          <h2 className="mt-1 font-serif text-2xl">
            {draft ? `Version ${draft.version}` : "No upload yet"}
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
          <span>Uploaded {formatDate(draft.updated_at || draft.created_at)}</span>
          <a
            href={`${paperStorageUrl(draft.pdf_storage_path)}?v=${draft.version}`}
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
          No working paper has been uploaded for this project yet. The library
          lists a project only after a director approves it with a PDF.
        </p>
      )}

      {draft?.pdf_storage_path && (
        <p className="mt-2 text-xs text-ink-45">
          Only the newest version is kept — each upload replaces the previous
          file.
        </p>
      )}

      {uploadAllowed && (
        <form
          onSubmit={onSubmit}
          className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-end"
        >
          <div className="flex-1 space-y-1.5">
            <label htmlFor="working-paper-file" className="text-sm leading-none font-medium">
              Upload a new version
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
            <p className="text-xs text-ink-45">PDF only, 20MB or smaller.</p>
          </div>
          <Button type="submit" size="sm" disabled={isPending}>
            <Upload className="size-4" />
            {isPending ? "Uploading..." : "Upload"}
          </Button>
        </form>
      )}

      {locked && canEdit && (
        <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-ink-70">
          This project is approved, so the working paper is locked. A director
          can reopen the project to allow edits and new uploads.
        </p>
      )}

      {!canEdit && (
        <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-ink-70">
          You have view-only access. The lead researcher and directors edit the
          project and upload working-paper versions.
        </p>
      )}
    </section>
  );
}
