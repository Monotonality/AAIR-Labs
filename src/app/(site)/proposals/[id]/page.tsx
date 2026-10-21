import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Pencil } from "lucide-react";

import { ProposalReviewPanel } from "@/components/proposals/proposal-review-panel";
import { ProposalSections } from "@/components/proposals/proposal-sections";
import { ProposalStatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthenticatedUser, isDirector } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/dates";
import { getProposalById } from "@/lib/data/proposals";
import { proposalCategoryLabel } from "@/lib/proposal-categories";

export const instant = false;

export const metadata: Metadata = {
  title: "Proposal · Current Research",
};

export default async function ProposalDetailPage(
  props: PageProps<"/proposals/[id]">,
) {
  await connection();
  const { id } = await props.params;

  const proposal = await getProposalById(id);
  if (!proposal) notFound();

  const user = await getAuthenticatedUser();
  const viewerIsDirector = user ? await isDirector(user) : false;
  const isAuthor = Boolean(user && user.id === proposal.author_id);
  const canEdit =
    viewerIsDirector || (isAuthor && proposal.status === "rejected");

  const author = proposal.author;
  const created = formatDate(proposal.created_at);
  const reviewed = formatDate(proposal.reviewed_at);

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href="/proposals"
        className="inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to current research
      </Link>

      <header className="mt-6 border-b border-line pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-[2px] uppercase">
            {proposalCategoryLabel(proposal.category)}
          </Badge>
          {(isAuthor || viewerIsDirector) && (
            <ProposalStatusBadge status={proposal.status} />
          )}
          {viewerIsDirector && (
            <Badge
              variant="outline"
              className={
                proposal.is_public
                  ? "rounded-[2px] uppercase"
                  : "rounded-[2px] border-orange bg-orange-tint text-orange uppercase"
              }
            >
              {proposal.is_public ? "Listed publicly" : "Private"}
            </Badge>
          )}
        </div>

        <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">
          {proposal.title}
        </h1>

        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-ink-70">
          {proposal.summary}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {author?.username ? (
            <Link
              href={`/researchers/${author.username}`}
              className="text-ink underline-offset-4 hover:underline"
            >
              {author.full_name || author.username}
            </Link>
          ) : (
            <span className="text-ink-70">AAIR Labs member</span>
          )}
          <span className="text-ink-45">Submitted {created}</span>
          {reviewed && viewerIsDirector && (
            <span className="text-ink-45">Reviewed {reviewed}</span>
          )}
        </div>

        {canEdit && (
          <div className="mt-6">
            <Button asChild size="sm">
              <Link href={`/proposals/${proposal.id}/edit`}>
                <Pencil />
                {isAuthor && !viewerIsDirector
                  ? "Edit and resubmit"
                  : "Edit proposal"}
              </Link>
            </Button>
          </div>
        )}
      </header>

      {viewerIsDirector && (
        <div className="mt-8">
          <ProposalReviewPanel proposal={proposal} />
        </div>
      )}

      {isAuthor && proposal.status === "pending" && (
        <Alert className="mt-8 border-line bg-paper">
          <AlertTitle>Under review</AlertTitle>
          <AlertDescription className="text-ink-70">
            This proposal is waiting on the Director of Research. You cannot
            edit it while it is under review.
          </AlertDescription>
        </Alert>
      )}

      {isAuthor && proposal.status === "rejected" && (
        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Denied, with feedback</AlertTitle>
          <AlertDescription>
            {proposal.director_feedback ||
              "The director did not leave written feedback. Edit the proposal below and resubmit it when you are ready."}
          </AlertDescription>
        </Alert>
      )}

      {proposal.status === "approved" && (
        <Alert className="mt-8 border-green bg-green-tint text-green">
          <AlertTitle>Approved</AlertTitle>
          <AlertDescription className="text-green">
            This proposal was approved by the Director of Research and is
            listed on Current Research while it is active.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-10">
        <ProposalSections proposal={proposal} />
      </div>
    </section>
  );
}
