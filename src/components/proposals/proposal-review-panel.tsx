"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
import type { Proposal } from "@/lib/types";

type ProposalReviewTarget = Pick<
  Proposal,
  "id" | "status" | "is_public" | "director_feedback" | "reviewed_at"
>;

export function ProposalReviewPanel({
  proposal,
}: {
  proposal: ProposalReviewTarget;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState(proposal.director_feedback ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function decide(decision: "approve" | "deny") {
    setError(null);
    setPendingAction(decision);
    startTransition(async () => {
      const result = await reviewProposal(proposal.id, decision, feedback);
      if (!result.ok) setError(result.error);
      setPendingAction(null);
      router.refresh();
    });
  }

  function toggleVisibility() {
    setError(null);
    setPendingAction("visibility");
    startTransition(async () => {
      const result = await setProposalVisibility(proposal.id, !proposal.is_public);
      if (!result.ok) setError(result.error);
      setPendingAction(null);
      router.refresh();
    });
  }

  const reviewed = formatDate(proposal.reviewed_at);

  return (
    <section className="space-y-4 border border-ink bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-45">
            Director review
          </p>
          <h2 className="font-serif text-2xl">Approve or deny</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              proposal.is_public
                ? "border-line text-ink-70"
                : "border-orange bg-orange-tint text-orange"
            }
          >
            {proposal.is_public ? "Public" : "Private"}
          </Badge>
          <ProposalStatusBadge status={proposal.status} />
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="space-y-1.5">
        <label
          htmlFor="director-feedback"
          className="text-sm leading-none font-medium"
        >
          Feedback for the author
        </label>
        <Textarea
          id="director-feedback"
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="What is complete, what is missing, and how the proposal fits the lab direction. Denials should tell the author what to change before resubmitting."
          maxLength={2000}
          disabled={isPending}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <Button
          size="sm"
          disabled={isPending || proposal.status === "approved"}
          onClick={() => decide("approve")}
        >
          {pendingAction === "approve" ? "Approving..." : "Approve"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={isPending || proposal.status === "rejected"}
          onClick={() => decide("deny")}
        >
          {pendingAction === "deny" ? "Denying..." : "Deny"}
        </Button>
        {proposal.status === "approved" && (
          <Button
            size="sm"
            variant="secondary"
            disabled={isPending}
            onClick={toggleVisibility}
          >
            {pendingAction === "visibility"
              ? "Saving..."
              : proposal.is_public
                ? "Set private"
                : "Set public"}
          </Button>
        )}
        <span className="ml-auto text-xs text-ink-45">
          {reviewed ? `Last reviewed ${reviewed}` : "Not reviewed yet"}
        </span>
      </div>
    </section>
  );
}
