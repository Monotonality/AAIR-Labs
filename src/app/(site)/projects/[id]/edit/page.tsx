import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { ProjectDetailsForm } from "@/components/projects/project-details-form";
import { PageHeader } from "@/components/shared/section-heading";
import { getAuthenticatedUser, isDirector } from "@/lib/auth-helpers";
import { getProjectById } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Edit Project · Working Papers",
};

export default async function ProjectEditPage(
  props: PageProps<"/projects/[id]/edit">,
) {
  await connection();
  const { id } = await props.params;

  const user = await getAuthenticatedUser();
  if (!user) {
    redirect(`/auth/login?next=/projects/${id}/edit`);
  }

  const project = await getProjectById(id);
  if (!project) redirect(`/projects/${id}`);

  const viewerIsDirector = await isDirector(user);
  const isLead = project.author_id === user.id;

  if (!viewerIsDirector && !isLead) redirect(`/projects/${id}`);
  // Leads edit only after a denial (to resubmit); pending and approved work is
  // under director control. Directly hitting the URL bounces back either way.
  if (!viewerIsDirector && project.status !== "rejected") {
    redirect(`/projects/${id}`);
  }

  return (
    <>
      <PageHeader
        kicker="Working papers"
        title="Edit project details"
        description="Title, description, project type, and the library metadata shown once the project is approved."
      />
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href={`/projects/${project.id}`}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to project
        </Link>
        <ProjectDetailsForm project={project} isDirector={viewerIsDirector} />
      </section>
    </>
  );
}
