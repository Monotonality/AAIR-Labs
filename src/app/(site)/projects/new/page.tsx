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
  title: "New Project · Working Papers",
};

export default async function NewProjectPage() {
  await connection();
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/auth/login?next=/projects/new");
  }
  if (!(await isAdmin(user))) {
    redirect("/projects");
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
        description="Link an approved proposal, choose the project type, name the lead researcher and co-authors, and send it to the working-paper stage."
      />
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/projects"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to projects
        </Link>
        <ProjectCreateForm proposals={proposals} members={members} />
      </section>
    </>
  );
}
