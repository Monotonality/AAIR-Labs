import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowUpRight, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/section-heading";
import { ProposalStatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthenticatedUser, isDirector } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/dates";
import { getActiveProjects, isApprovedMember } from "@/lib/data/queries";
import { authorNames, draftStageLabel } from "@/lib/papers";
import { proposalCategoryLabel } from "@/lib/proposal-categories";

export const instant = false;

export const metadata: Metadata = {
  title: "Active Research · Portal",
};

export default async function ActiveResearchPage() {
  await connection();
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/auth/login?next=/portal/active-research");
  }

  const [director, member] = await Promise.all([
    isDirector(user),
    isApprovedMember(user.id),
  ]);
  const canView = director || member;
  const projects = canView ? await getActiveProjects() : [];

  return (
    <>
      <PageHeader
        kicker="Member portal"
        title="Active Research"
        description="Every AAIR Labs project in progress: who is on it, what was last submitted, and where it stands in review. Published papers move to the library."
      >
        {director && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="sm">
              <Link href="/portal/active-research/new">
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
        {!canView ? (
          <div className="border border-dashed border-line bg-surface px-6 py-16 text-center">
            <p className="font-serif text-2xl text-ink">Members only</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-70">
              Active research opens up once your membership application is
              approved.
            </p>
            <div className="mt-6">
              <Button asChild size="sm" variant="outline">
                <Link href="/portal">Back to portal</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="border-b border-line pb-4 text-sm text-ink-70">
              {projects.length === 0
                ? "No projects in progress."
                : `${projects.length} project${projects.length === 1 ? "" : "s"} in progress`}
            </p>

            {projects.length > 0 && (
              <ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => {
                  const draft = project.draft?.pdf_storage_path ? project.draft : null;
                  const isLead = project.author_id === user.id;
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
                            href={`/portal/active-research/${project.id}`}
                            className="underline-offset-4 hover:underline"
                          >
                            {project.title}
                          </Link>
                        </h2>

                        <p className="line-clamp-3 text-sm leading-relaxed text-ink-70">
                          {project.abstract}
                        </p>

                        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-ink-70">{authorNames(project)}</span>
                            <span className="text-xs text-ink-45">
                              {draft
                                ? `${draftStageLabel(draft.stage) ?? "Working paper"} v${draft.version}`
                                : "Nothing submitted yet"}
                              {" · "}
                              Updated {formatDate(project.updated_at)}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {isLead && (
                              <Link
                                href={`/portal/my-research/${project.id}`}
                                className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-45 hover:text-ink"
                              >
                                You lead · Manage
                              </Link>
                            )}
                            <Link
                              href={`/portal/active-research/${project.id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-ink underline-offset-4 hover:underline"
                            >
                              Open
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
          </>
        )}
      </section>
    </>
  );
}
