import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Pencil } from "lucide-react";

import { ProjectReviewPanel } from "@/components/projects/project-review-panel";
import { WorkingPaperPanel } from "@/components/projects/working-paper-panel";
import { ProposalStatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthenticatedUser, isDirector } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/dates";
import { getProjectById } from "@/lib/data/queries";
import { projectAuthors } from "@/lib/papers";
import { proposalCategoryLabel } from "@/lib/proposal-categories";

export const instant = false;

export const metadata: Metadata = {
  title: "Project · Working Papers",
};

function roleBadge(role: string) {
  return role === "author" ? "Lead" : "Co-author";
}

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[id]">,
) {
  await connection();
  const { id } = await props.params;

  const user = await getAuthenticatedUser();
  if (!user) {
    redirect(`/auth/login?next=/projects/${id}`);
  }

  const project = await getProjectById(id);
  if (!project) notFound();

  const viewerIsDirector = await isDirector(user);
  const isLead = project.author_id === user.id;
  const isMember =
    isLead || Boolean(project.co_authors?.some((author) => author.profile_id === user.id));
  const canEdit = isLead || viewerIsDirector;
  const hasDraft = Boolean(project.draft?.pdf_storage_path);
  const inLibrary = project.status === "approved" && hasDraft;
  const canOpenEditor =
    viewerIsDirector || (isLead && project.status === "rejected");

  const roster = projectAuthors(project);
  const updated = formatDate(project.updated_at);

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to your projects
      </Link>

      <header className="mt-6 border-b border-line pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-[2px] uppercase">
            {proposalCategoryLabel(project.category)}
          </Badge>
          {(isMember || viewerIsDirector) && (
            <ProposalStatusBadge status={project.status} />
          )}
          {project.target_domain && (
            <Badge variant="outline" className="rounded-[2px] text-ink-70">
              {project.target_domain}
            </Badge>
          )}
        </div>

        <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">
          {project.title}
        </h1>

        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-ink-70">
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
                {roleBadge(entry.role)}
              </span>
            </span>
          ))}
          <span className="text-ink-45">Updated {updated}</span>
        </div>

        {project.proposal && (
          <p className="mt-4 text-sm text-ink-70">
            Created from proposal{" "}
            <Link
              href={`/proposals/${project.proposal.id}`}
              className="font-semibold text-ink underline underline-offset-4"
            >
              {project.proposal.title}
            </Link>
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {canOpenEditor && (
            <Button asChild size="sm">
              <Link href={`/projects/${project.id}/edit`}>
                <Pencil />
                Edit details
              </Link>
            </Button>
          )}
          {inLibrary && (
            <Button asChild size="sm" variant="secondary">
              <Link href={`/library/${project.id}`}>View in library</Link>
            </Button>
          )}
          {isLead && !viewerIsDirector && project.status === "approved" && (
            <span className="text-sm text-ink-45">
              Approved and locked — a director can reopen it for changes.
            </span>
          )}
          {!canEdit && !inLibrary && (
            <span className="text-sm text-ink-45">
              View-only access — the lead researcher and directors manage this
              project.
            </span>
          )}
        </div>
      </header>

      {viewerIsDirector && (
        <div className="mt-8">
          <ProjectReviewPanel project={project} hasDraft={hasDraft} />
        </div>
      )}

      {isLead && !viewerIsDirector && project.status === "pending" && (
        <Alert className="mt-8 border-line bg-paper">
          <AlertTitle>Under review</AlertTitle>
          <AlertDescription className="text-ink-70">
            The project is waiting on the Director of Research. You can still
            upload working-paper versions; details are locked until the director
            responds.
          </AlertDescription>
        </Alert>
      )}

      {isLead && !viewerIsDirector && project.status === "rejected" && (
        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Denied, with feedback</AlertTitle>
          <AlertDescription>
            {project.director_feedback ||
              "The director did not leave written feedback. Edit the details or upload a revised working paper to resubmit the project."}
          </AlertDescription>
        </Alert>
      )}

      {project.status === "approved" && (
        <Alert className="mt-8 border-green bg-green-tint text-green">
          <AlertTitle>Approved</AlertTitle>
          <AlertDescription className="text-green">
            {inLibrary
              ? "This project is approved and listed in the public library."
              : "This project is approved. It appears in the library once a working paper is attached."}
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-8">
        <WorkingPaperPanel project={project} canEdit={canEdit} />
      </div>

      <section className="mt-8 rounded-[2px] border border-line bg-surface p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-45">
          Library metadata
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
