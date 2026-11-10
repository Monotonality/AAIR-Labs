import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { ProjectDetailsForm } from "@/components/projects/project-details-form";
import { ProjectMembersForm } from "@/components/projects/project-members-form";
import { ReviewTimeline } from "@/components/projects/review-timeline";
import { WorkingPaperPanel } from "@/components/projects/working-paper-panel";
import { PageHeader } from "@/components/shared/section-heading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAuthenticatedUser, isDirector } from "@/lib/auth-helpers";
import {
  getProjectById,
  getProjectReviewEvents,
  getResearchers,
} from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Manage Project · My Research",
};

export default async function MyResearchProjectPage(
  props: PageProps<"/portal/my-research/[id]">,
) {
  await connection();
  const { id } = await props.params;

  const user = await getAuthenticatedUser();
  if (!user) {
    redirect(`/auth/login?next=/portal/my-research/${id}`);
  }

  const [project, director] = await Promise.all([getProjectById(id), isDirector(user)]);
  if (!project) notFound();

  const isLead = project.author_id === user.id;
  if (!isLead && !director) redirect(`/portal/active-research/${id}`);

  const [events, members] = await Promise.all([
    getProjectReviewEvents(id),
    getResearchers(),
  ]);

  const published = project.status === "approved";
  const lockedForLead = published && !director;
  const latestDecision = events.find((e) => e.kind === "approved" || e.kind === "denied");

  return (
    <>
      <PageHeader
        kicker={director && !isLead ? "Director edit" : "My Research"}
        title={project.title}
        description="Edit the description, tags, and team, and submit PDFs for director review."
      />
      <section className="mx-auto w-full max-w-4xl space-y-8 px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={isLead ? "/portal" : "/portal/active-research"}
            className="inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            {isLead ? "Back to portal" : "Active research"}
          </Link>
          <Link
            href={`/portal/active-research/${project.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink underline-offset-4 hover:underline"
          >
            See what members see
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {project.status === "rejected" && latestDecision?.kind === "denied" && (
          <Alert variant="destructive">
            <AlertTitle>Last submission was denied</AlertTitle>
            <AlertDescription className="whitespace-pre-line">
              {latestDecision.body}
              {"\n\n"}Submit a revised PDF below to send it back for review.
            </AlertDescription>
          </Alert>
        )}

        {project.status === "pending" && project.draft?.pdf_storage_path && (
          <Alert className="border-line bg-paper">
            <AlertTitle>Waiting on a director</AlertTitle>
            <AlertDescription className="text-ink-70">
              Your latest PDF is in the review queue. You can keep editing and
              replace the PDF in the meantime.
            </AlertDescription>
          </Alert>
        )}

        {published && (
          <Alert className="border-green bg-green-tint text-green">
            <AlertTitle>Published</AlertTitle>
            <AlertDescription className="text-green">
              {director
                ? "This paper is published. Reopen it from the review panel on the project page before the team can change it."
                : "This paper is published and locked. Ask a director to reopen it if it needs changes."}
            </AlertDescription>
          </Alert>
        )}

        <WorkingPaperPanel project={project} canEdit />

        {!lockedForLead && (
          <>
            <ProjectDetailsForm project={project} isDirector={director} />
            <ProjectMembersForm project={project} members={members} isDirector={director} />
          </>
        )}

        <ReviewTimeline events={events} />
      </section>
    </>
  );
}
