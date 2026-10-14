import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { MarketingGenerator } from "@/components/portal/marketing-generator";
import { MeetingGenerator } from "@/components/portal/meeting-generator";
import { SpotlightGenerator } from "@/components/portal/spotlight-generator";
import { PageHeader } from "@/components/shared/section-heading";
import { getAuthenticatedUser, isAdmin } from "@/lib/auth-helpers";

export const instant = false;

export const metadata: Metadata = {
  title: "Generate Marketing · Portal",
};

export default async function PortalMarketingPage() {
  await connection();
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login?next=/portal/marketing");
  }
  if (!(await isAdmin(user))) {
    redirect("/portal");
  }

  return (
    <>
      <PageHeader
        kicker="Admin"
        title="Generate Marketing"
        description="Fill in the event details, then generate the square and story graphics."
      />
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <Link
          href="/portal"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to portal
        </Link>
        <div className="space-y-16">
          <div className="space-y-6">
            <h2 className="font-serif text-2xl">Tacos &amp; Technology</h2>
            <MarketingGenerator />
          </div>
          <div className="space-y-6">
            <h2 className="font-serif text-2xl">General Meeting</h2>
            <MeetingGenerator />
          </div>
          <div className="space-y-6">
            <h2 className="font-serif text-2xl">Member Spotlight</h2>
            <SpotlightGenerator />
          </div>
        </div>
      </section>
    </>
  );
}
