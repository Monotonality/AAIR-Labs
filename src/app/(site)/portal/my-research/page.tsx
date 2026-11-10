import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { PageHeader } from "@/components/shared/section-heading";
import { ProposalStatusBadge } from "@/components/shared/status-badge";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/dates";
import { getLedProjects } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "My Research · Portal",
};

/** Projects the member leads. With exactly one, go straight to it. */
export default async function MyResearchPage() {
  await connection();
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/auth/login?next=/portal/my-research");
  }

  const projects = await getLedProjects(user.id);
  if (projects.length === 1) {
    redirect(`/portal/my-research/${projects[0].id}`);
  }

  return (
    <>
      <PageHeader
        kicker="Member portal"
        title="My Research"
        description="Projects you lead. Edit the details and team, and submit PDFs for director review."
      />
      <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <Link
          href="/portal"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to portal
        </Link>

        {projects.length === 0 ? (
          <div className="border border-dashed border-line bg-surface px-6 py-16 text-center">
            <p className="font-serif text-2xl text-ink">You do not lead a project</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-70">
              A director assigns a lead when a project is created. You can still
              follow every project under Active Research.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/portal/my-research/${project.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 border border-line bg-surface p-5 transition-colors hover:border-ink/60"
                >
                  <div>
                    <p className="font-serif text-xl">{project.title}</p>
                    <p className="mt-1 text-xs text-ink-45">
                      Updated {formatDate(project.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ProposalStatusBadge status={project.status} />
                    <ArrowUpRight className="size-4" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
