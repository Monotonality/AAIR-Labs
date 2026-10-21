import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { ProjectsManager } from "@/components/projects/projects-manager";
import { PageHeader } from "@/components/shared/section-heading";
import { getAuthenticatedUser, isAdmin } from "@/lib/auth-helpers";
import { getAllProjects } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Review Projects · Portal",
};

export default async function PortalProjectsReviewPage() {
  await connection();
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login?next=/portal/projects/review");
  }
  if (!(await isAdmin(user))) {
    redirect("/portal");
  }

  const projects = await getAllProjects();

  return (
    <>
      <PageHeader
        kicker="Admin"
        title="Review Projects"
        description="Approve or deny working-paper projects, leave feedback for the team, and reopen approved projects when they need changes."
      />
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <Link
          href="/portal"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to portal
        </Link>
        <ProjectsManager projects={projects} />
      </section>
    </>
  );
}
