import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Pencil } from "lucide-react";

import { ProjectReviewPanel } from "@/components/projects/project-review-panel";
import { ReviewTimeline } from "@/components/projects/review-timeline";
import { WorkingPaperPanel } from "@/components/projects/working-paper-panel";
import { ProposalStatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthenticatedUser, isDirector } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/dates";
import {
  getProjectById,
  getProjectReviewEvents,
  isApprovedMember,
} from "@/lib/data/queries";
import { projectAuthors } from "@/lib/papers";
import { proposalCategoryLabel } from "@/lib/proposal-categories";

export const instant = false;

export const metadata: Metadata = {
  title: "Project · Active Research",
};

export default async function ActiveResearchProjectPage(
  props: PageProps<"/portal/active-research/[id]">,
) {
  await connection();
  const { id } = await props.params;

  const user = await getAuthenticatedUser();
  if (!user) {
    redirect(`/auth/login?next=/portal/active-research/${id}`);
  }

  const [project, events, director, member] = await Promise.all([
    getProjectById(id),
    getProjectReviewEvents(id),
    isDirector(user),
    isApprovedMember(user.id),
  ]);
  if (!project) notFound();

  const isLead = project.author_id === user.id;
  const onTeam =
    isLead || Boolean(project.co_authors?.some((row) => row.profile_id === user.id));
  if (!director && !member && !onTeam) redirect("/portal/active-research");

  const canManage = isLead || director;
  const hasDraft = Boolean(project.draft?.pdf_storage_path);
  const published = project.status === "approved" && hasDraft;
  const roster = projectAuthors(project);

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href="/portal/active-research"
        className="inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Active research
      </Link>

      <header className="mt-6 border-b border-line pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-[2px] uppercase">
            {proposalCategoryLabel(project.category)}
          </Badge>
          <ProposalStatusBadge status={project.status} />
          {project.target_domain && (
            <Badge variant="outline" className="rounded-[2px] text-ink-70">
              {project.target_domain}
            </Badge>
          )}
        </div>

        <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">
          {project.title}
        </h1>

        <p className="mt-4 max-w-[62ch] whitespace-pre-line text-base leading-relaxed text-ink-70">
          {project.abstract}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {roster.map((entry) => (
            <span key={entry.profile.id} className="text-ink">
              {entry.profile.username ? (
                <Link
                  href={`/researchers/${entry.profile.username}`}
                  className="underline-offset-4 hover:underline"
                >
                  {entry.profile.full_name || entry.profile.username}
                </Link>
              ) : (
                entry.profile.full_name
              )}
              <span className="ml-1.5 text-xs text-ink-45">
                {entry.role === "author" ? "Lead" : "Co-author"}
              </span>
            </span>
          ))}
          <span className="text-ink-45">Updated {formatDate(project.updated_at)}</span>
        </div>

        {project.proposal && (
          <p className="mt-4 text-sm text-ink-70">
            From proposal{" "}
            <Link
              href={`/proposals/${project.proposal.id}`}
              className="font-semibold text-ink underline underline-offset-4"
            >
              {project.proposal.title}
            </Link>
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {canManage && (
            <Button asChild size="sm">
              <Link href={`/portal/my-research/${project.id}`}>
                <Pencil />
                {isLead ? "Manage in My Research" : "Edit project"}
              </Link>
            </Button>
          )}
          {published && (
            <Button asChild size="sm" variant="secondary">
              <Link href={`/library/${project.id}`}>View in library</Link>
            </Button>
          )}
        </div>
      </header>

      {published && (
        <Alert className="mt-8 border-green bg-green-tint text-green">
          <AlertTitle>Published</AlertTitle>
          <AlertDescription className="text-green">
            This paper was approved and is listed in the library and on its
            authors&apos; researcher pages.
          </AlertDescription>
        </Alert>
      )}

      {director && (
        <div className="mt-8">
          <ProjectReviewPanel project={project} hasDraft={hasDraft} />
        </div>
      )}

      <div className="mt-8">
        <WorkingPaperPanel
          project={project}
          canEdit={false}
          manageHref={canManage ? `/portal/my-research/${project.id}` : undefined}
        />
      </div>

      <div className="mt-8">
        <ReviewTimeline events={events} />
      </div>

      <section className="mt-8 rounded-[2px] border border-line bg-surface p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-45">
          Tags
        </p>
        <h2 className="mt-1 font-serif text-2xl">How this project is described</h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {[
            { label: "Topics", values: project.topics },
            { label: "Geographic scope", values: project.geographic_scope },
            { label: "Methodology", values: project.methodology },
            { label: "Data sources", values: project.data_sources },
          ].map((field) => (
            <div key={field.label}>
              <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-45">
                {field.label}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink-70">
                {field.values && field.values.length > 0
                  ? field.values.join(", ")
                  : "Not set yet"}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </section>
  );
}
