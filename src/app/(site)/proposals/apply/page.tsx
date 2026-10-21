import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { ProposalForm } from "@/components/proposals/proposal-form";
import { PageHeader } from "@/components/shared/section-heading";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { getProfileById } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Make a Proposal",
};

export default async function ApplyProposalPage() {
  await connection();
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login?next=/proposals/apply");
  }

  const { profile } = await getProfileById(user.id);

  return (
    <>
      <PageHeader
        kicker="Proposals"
        title="Make a Proposal"
        description="Choose a category, answer the required questions, and submit the proposal for review by the Director of Research."
      />
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/proposals/help"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          How proposals work
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-line bg-paper px-4 py-3 text-sm text-ink-70">
          <span>
            Submitting as{" "}
            <strong className="text-ink">
              {profile?.full_name || profile?.username || "this account"}
            </strong>
          </span>
          <span className="text-xs text-ink-45">
            You become the Lead Researcher and first author.
          </span>
        </div>

        <ProposalForm mode="create" />
      </section>
    </>
  );
}
