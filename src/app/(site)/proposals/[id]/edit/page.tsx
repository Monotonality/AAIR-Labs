import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { ProposalForm } from "@/components/proposals/proposal-form";
import { ProposalStatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/section-heading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAuthenticatedUser, isDirector } from "@/lib/auth-helpers";
import { getProposalById } from "@/lib/data/proposals";
import { proposalCategoryLabel } from "@/lib/proposal-categories";

export const instant = false;

export const metadata: Metadata = {
  title: "Edit Proposal",
};

export default async function EditProposalPage(
  props: PageProps<"/proposals/[id]/edit">,
) {
  await connection();
  const { id } = await props.params;

  const proposal = await getProposalById(id);
  if (!proposal) notFound();

  const user = await getAuthenticatedUser();
  if (!user) {
    redirect(`/auth/login?next=/proposals/${id}/edit`);
  }

  const director = await isDirector(user);
  const isAuthor = user.id === proposal.author_id;
  if (!director && !(isAuthor && proposal.status === "rejected")) {
    redirect(`/proposals/${id}`);
  }

  const resubmission = isAuthor && !director;

  return (
    <>
      <PageHeader
        kicker="Proposals"
        title={resubmission ? "Edit and resubmit" : "Edit proposal"}
        description={
          resubmission
            ? "Update the proposal with the director's feedback and send it back for another review."
            : "Revise this proposal on behalf of the author. Saving keeps the current review status."
        }
      />
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href={`/proposals/${proposal.id}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to proposal
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-line bg-paper px-4 py-3">
          <span className="text-sm text-ink-70">
            {proposalCategoryLabel(proposal.category)}
          </span>
          <ProposalStatusBadge status={proposal.status} />
        </div>

        {resubmission && proposal.director_feedback && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Director feedback</AlertTitle>
            <AlertDescription>{proposal.director_feedback}</AlertDescription>
          </Alert>
        )}

        <ProposalForm mode="edit" proposal={proposal} />
      </section>
    </>
  );
}
