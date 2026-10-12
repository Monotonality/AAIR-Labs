import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { ExternalReadingManager } from "@/components/portal/external-reading-manager";
import { PageHeader } from "@/components/shared/section-heading";
import { getAuthenticatedUser, isAdmin } from "@/lib/auth-helpers";
import { getExternalReadings } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "External reading · Portal",
};

export default async function PortalExternalReadingPage() {
  await connection();
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login?next=/portal/external-reading");
  }
  if (!(await isAdmin(user))) {
    redirect("/portal");
  }

  const readings = await getExternalReadings();

  return (
    <>
      <PageHeader
        kicker="Admin"
        title="External reading"
        description="Add sources AAIR Labs did not produce, and write or revise the context members see in the public library."
      />
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <Link
          href="/portal"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to portal
        </Link>
        <ExternalReadingManager readings={readings} />
      </section>
    </>
  );
}
