import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { ApplicationsManager } from "@/components/portal/applications-manager";
import { PageHeader } from "@/components/shared/section-heading";
import { getAuthenticatedUser, isAdmin } from "@/lib/auth-helpers";
import { getApplications } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Applications · Portal",
};

export default async function PortalApplicationsPage() {
  await connection();
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login?next=/portal/applications");
  }
  if (!(await isAdmin(user))) {
    redirect("/portal");
  }

  const applications = await getApplications();

  return (
    <>
      <PageHeader
        kicker="Admin"
        title="Manage Applications"
        description="Review incoming membership applications and accept or deny them."
      />
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <Link
          href="/portal"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to portal
        </Link>
        <ApplicationsManager applications={applications} />
      </section>
    </>
  );
}
