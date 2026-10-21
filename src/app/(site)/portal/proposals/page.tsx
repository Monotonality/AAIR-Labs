import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, ArrowUpRight, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/section-heading";
import { ProposalStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/dates";
import { getProposalsByAuthor } from "@/lib/data/proposals";
import { proposalCategoryLabel } from "@/lib/proposal-categories";

export const instant = false;

export const metadata: Metadata = {
  title: "My Proposals · Portal",
};

export default async function MyProposalsPage() {
  await connection();
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login?next=/portal/proposals");
  }

  const proposals = await getProposalsByAuthor(user.id);

  return (
    <>
      <PageHeader
        kicker="Member portal"
        title="My Proposals"
        description="Every proposal you have submitted, its review status, and the links you can share."
      >
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild size="sm">
            <Link href="/proposals/apply">
              <Plus />
              Make a proposal
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/proposals/help">Proposal guidelines</Link>
          </Button>
        </div>
      </PageHeader>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <Link
          href="/portal"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to portal
        </Link>

        {proposals.length === 0 ? (
          <div className="border border-dashed border-line bg-surface px-6 py-16 text-center">
            <p className="font-serif text-2xl text-ink">
              No proposals yet
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-70">
              Submit a research project, whitepaper, or analysis project and
              the Director of Research will review it for completeness and fit
              with the lab direction.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="sm">
                <Link href="/proposals/apply">Make a proposal</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/proposals/help">Read the guidelines</Link>
              </Button>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {proposals.map((proposal) => (
              <li key={proposal.id} className="border border-line bg-surface p-6">
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
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-70">
                      {proposal.summary}
                    </p>
                  </div>
                  <ProposalStatusBadge status={proposal.status} />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-xs text-ink-45">
                  <span>Submitted {formatDate(proposal.created_at)}</span>
                  {proposal.reviewed_at && (
                    <span>Reviewed {formatDate(proposal.reviewed_at)}</span>
                  )}
                  {proposal.status === "approved" && (
                    <span>
                      {proposal.is_public
                        ? "Listed publicly"
                        : "Private until a director lists it"}
                    </span>
                  )}
                  <Link
                    href={`/proposals/${proposal.id}`}
                    className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-ink hover:underline underline-offset-4"
                  >
                    View proposal
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
