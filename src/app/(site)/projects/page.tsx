import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/section-heading";
import { ProposalStatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthenticatedUser, isDirector } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/dates";
import { getAllProjects, getMyProjects } from "@/lib/data/queries";
import { proposalCategoryLabel } from "@/lib/proposal-categories";
import { authorNames } from "@/lib/papers";
import type { Project } from "@/lib/types";

export const instant = false;

export const metadata: Metadata = {
  title: "Working Papers · Projects",
};

function roleLabel(project: Project, userId: string, director: boolean) {
  if (project.author_id === userId) return "Lead";
  if (project.co_authors?.some((author) => author.profile_id === userId)) {
    return "Co-author";
  }
  if (director) return "Director view";
  return null;
}

export default async function ProjectsPage() {
  await connection();
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/auth/login?next=/projects");
  }

  const director = await isDirector(user);
  const projects = director
    ? await getAllProjects()
    : await getMyProjects(user.id);

  return (
    <>
      <PageHeader
        kicker="Working papers"
        title="Your Projects"
        description="Projects you lead or co-author, with the current working paper and review status. Directors see every project here."
      >
        {director && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="sm">
              <Link href="/projects/new">
                <Plus />
                New project
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/portal/projects/review">Review queue</Link>
            </Button>
          </div>
        )}
      </PageHeader>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
          <p className="text-sm text-ink-70">
            {projects.length === 0
              ? "No projects yet."
              : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {projects.length > 0 && (
          <ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const role = roleLabel(project, user.id, director);
              const hasDraft = Boolean(project.draft?.pdf_storage_path);
              return (
                <li key={project.id} className="flex">
                  <article className="flex w-full flex-col gap-3 border border-line bg-surface p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Badge variant="outline" className="rounded-[2px] uppercase">
                        {proposalCategoryLabel(project.category)}
                      </Badge>
                      <ProposalStatusBadge status={project.status} />
                    </div>

                    <h2 className="font-serif text-2xl leading-snug">
                      <Link
                        href={`/projects/${project.id}`}
                        className="hover:underline underline-offset-4"
                      >
                        {project.title}
                      </Link>
                    </h2>

                    <p className="line-clamp-3 text-sm leading-relaxed text-ink-70">
                      {project.abstract}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-ink-70">
                          {authorNames(project)}
                        </span>
                        <span className="text-xs text-ink-45">
                          {hasDraft ? `Working paper v${project.draft?.version}` : "No working paper yet"}
                          {" · "}
                          Updated {formatDate(project.updated_at)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {role && (
                          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-45">
                            {role}
                          </span>
                        )}
                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-ink hover:underline underline-offset-4"
                        >
                          Open project
                          <ArrowUpRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}

        {projects.length === 0 && (
          <div className="mt-6 border border-dashed border-line bg-surface px-6 py-16 text-center">
            <p className="font-serif text-2xl text-ink">No projects yet</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-70">
              {director
                ? "Create a project from an approved proposal, choose the lead researcher and co-authors, and the team uploads the working paper for your review."
                : "Projects you lead or co-author will appear here. A director creates projects from approved proposals — you can submit one first."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {director && (
                <Button asChild size="sm">
                  <Link href="/projects/new">
                    <Plus />
                    New project
                  </Link>
                </Button>
              )}
              <Button asChild size="sm" variant="outline">
                <Link href="/proposals">
                  Browse current research
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
