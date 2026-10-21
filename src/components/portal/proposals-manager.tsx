"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import {
  reviewProposal,
  setProposalVisibility,
} from "@/lib/actions/proposals";
import { ProposalStatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/dates";
import { proposalCategoryLabel } from "@/lib/proposal-categories";
import type { Proposal, ProposalStatus } from "@/lib/types";

const STATUS_ORDER: Record<ProposalStatus, number> = {
  pending: 0,
  rejected: 1,
  revision_requested: 2,
  approved: 3,
};

export function ProposalsManager({ proposals }: { proposals: Proposal[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      proposals.map((proposal) => [proposal.id, proposal.director_feedback ?? ""]),
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

  if (proposals.length === 0) {
    return (
      <div className="border border-dashed border-line bg-surface px-6 py-16 text-center">
        <p className="font-serif text-2xl text-ink">No proposals yet</p>
        <p className="mt-2 text-sm text-ink-70">
          Submitted proposals will appear here for review.
        </p>
      </div>
    );
  }

  const ordered = [...proposals].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive">{error}</Alert>}

      <ul className="space-y-4">
        {ordered.map((proposal) => {
          const busy = isPending && busyId === proposal.id;
          const submitted = formatDate(proposal.created_at);

          return (
            <li
              key={proposal.id}
              className="border border-line bg-surface p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-45">
                    {proposalCategoryLabel(proposal.category)}
                  </p>
                  <h2 className="mt-1 font-serif text-2xl leading-tight">
                    <Link
                      href={`/proposals/${proposal.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {proposal.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-ink-70">
                    {proposal.author?.full_name ||
                      proposal.author?.username ||
                      "AAIR Labs member"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      proposal.is_public
                        ? "rounded-[2px] uppercase"
                        : "rounded-[2px] border-orange bg-orange-tint text-orange uppercase"
                    }
                  >
                    {proposal.is_public ? "Public" : "Private"}
                  </Badge>
                  <ProposalStatusBadge status={proposal.status} />
                </div>
              </div>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-70">
                {proposal.summary}
              </p>

              <div className="mt-5 space-y-1.5">
                <label
                  htmlFor={`feedback-${proposal.id}`}
                  className="text-sm leading-none font-medium"
                >
                  Feedback for the author
                </label>
                <Textarea
                  id={`feedback-${proposal.id}`}
                  rows={3}
                  value={feedback[proposal.id] ?? ""}
                  onChange={(e) =>
                    setFeedback((prev) => ({
                      ...prev,
                      [proposal.id]: e.target.value,
                    }))
                  }
                  placeholder="Completeness, fit with the lab direction, and what to change before resubmitting."
                  maxLength={2000}
                  disabled={busy}
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                <Button
                  size="sm"
                  disabled={busy || proposal.status === "approved"}
                  onClick={() =>
                    run(proposal.id, () =>
                      reviewProposal(
                        proposal.id,
                        "approve",
                        feedback[proposal.id],
                      ),
                    )
                  }
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busy || proposal.status === "rejected"}
                  onClick={() =>
                    run(proposal.id, () =>
                      reviewProposal(proposal.id, "deny", feedback[proposal.id]),
                    )
                  }
                >
                  Deny
                </Button>
                {proposal.status === "approved" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      run(proposal.id, () =>
                        setProposalVisibility(proposal.id, !proposal.is_public),
                      )
                    }
                  >
                    {proposal.is_public ? "Set private" : "Set public"}
                  </Button>
                )}
                <Link
                  href={`/proposals/${proposal.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-ink hover:underline underline-offset-4"
                >
                  Open proposal
                  <ArrowUpRight className="size-3.5" />
                </Link>
                <span className="ml-auto text-xs text-ink-45">
                  Submitted {submitted}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
