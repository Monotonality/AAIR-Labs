import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { ProposalsManager } from "@/components/portal/proposals-manager";
import { PageHeader } from "@/components/shared/section-heading";
import { getAuthenticatedUser, isAdmin } from "@/lib/auth-helpers";
import { getAllProposals } from "@/lib/data/proposals";

export const instant = false;

export const metadata: Metadata = {
  title: "Review Proposals · Portal",
};

export default async function PortalProposalsReviewPage() {
  await connection();
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login?next=/portal/proposals/review");
  }
  if (!(await isAdmin(user))) {
    redirect("/portal");
  }

  const proposals = await getAllProposals();

  return (
    <>
      <PageHeader
        kicker="Admin"
        title="Review Proposals"
        description="Approve or deny submitted proposals, leave feedback for the author, and control which approved proposals are listed publicly."
      />
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <Link
          href="/portal"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to portal
        </Link>
        <ProposalsManager proposals={proposals} />
      </section>
    </>
  );
}
