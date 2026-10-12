"use client";

import { useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { setApplicationStatus } from "@/lib/actions/applications";
import { gradTermLabel } from "@/lib/profile";
import type { Application, ApplicationStatus } from "@/lib/types";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_CLASS: Record<ApplicationStatus, string> = {
  pending: "bg-line/40 text-ink-70",
  approved: "bg-green/10 text-green",
  rejected: "bg-destructive/10 text-destructive",
};

const DT_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-45";

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ApplicationsManager({
  applications,
}: {
  applications: Application[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function decide(id: string, status: ApplicationStatus) {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await setApplicationStatus(id, status);
      if (!result.ok) setError(result.error);
      setPendingId(null);
    });
  }

  if (applications.length === 0) {
    return (
      <div className="border border-dashed border-line bg-surface px-6 py-16 text-center">
        <p className="font-serif text-2xl text-ink">No applications yet</p>
        <p className="mt-2 text-sm text-ink-70">
          New membership applications will appear here as they are submitted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive">{error}</Alert>}

      <ul className="space-y-4">
        {applications.map((application) => {
          const data = application.form_data ?? {};
          const name =
            data.fullName ||
            application.applicant?.full_name ||
            "Unnamed applicant";
          const email = data.email || application.applicant?.email || "";
          const busy = isPending && pendingId === application.id;

          return (
            <li key={application.id} className="border border-line bg-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl leading-tight">{name}</h2>
                  {email && <p className="text-sm text-ink-70">{email}</p>}
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[application.status]}`}
                >
                  {STATUS_LABEL[application.status]}
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className={DT_CLASS}>University</dt>
                  <dd className="mt-0.5 text-ink">{data.university || "-"}</dd>
                </div>
                <div>
                  <dt className={DT_CLASS}>Major</dt>
                  <dd className="mt-0.5 text-ink">{data.major || "-"}</dd>
                </div>
                <div>
                  <dt className={DT_CLASS}>Expected graduation</dt>
                  <dd className="mt-0.5 text-ink">
                    {gradTermLabel(data.expectedGradDate) || "-"}
                  </dd>
                </div>
                <div>
                  <dt className={DT_CLASS}>Personal email</dt>
                  <dd className="mt-0.5 text-ink">{data.personalEmail || "-"}</dd>
                </div>
              </dl>

              {data.bio && (
                <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-ink-70">
                  {data.bio}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                <Button
                  size="sm"
                  disabled={busy || application.status === "approved"}
                  onClick={() => decide(application.id, "approved")}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busy || application.status === "rejected"}
                  onClick={() => decide(application.id, "rejected")}
                >
                  Deny
                </Button>
                {application.status !== "pending" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => decide(application.id, "pending")}
                  >
                    Reset to pending
                  </Button>
                )}
                <span className="ml-auto text-xs text-ink-45">
                  Submitted {formatDate(application.created_at)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
