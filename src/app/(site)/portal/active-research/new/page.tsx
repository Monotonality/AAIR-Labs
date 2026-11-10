import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { ProjectCreateForm } from "@/components/projects/project-create-form";
import { PageHeader } from "@/components/shared/section-heading";
import { getAuthenticatedUser, isAdmin } from "@/lib/auth-helpers";
import { getApprovedProposals } from "@/lib/data/proposals";
import { getResearchers } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "New Project · Active Research",
};

export default async function NewProjectPage() {
  await connection();
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/auth/login?next=/portal/active-research/new");
  }
  if (!(await isAdmin(user))) {
    redirect("/portal/active-research");
  }

  const [proposals, members] = await Promise.all([
    getApprovedProposals(),
    getResearchers(),
  ]);

  return (
    <>
      <PageHeader
        kicker="Admin"
        title="Create a project"
        description="Optionally link the approved proposal it came from, choose the project type, and name the lead researcher. The lead takes it from there in My Research."
      />
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/portal/active-research"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to active research
        </Link>
        <ProjectCreateForm proposals={proposals} members={members} />
      </section>
    </>
  );
}
