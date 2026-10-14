import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { OnboardingChecklist } from "@/components/portal/onboarding-checklist";
import { PageHeader } from "@/components/shared/section-heading";
import { Alert } from "@/components/ui/alert";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { getProfileById, isApprovedMember } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Onboarding · Portal",
};

export default async function PortalOnboardingPage() {
  await connection();
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login?next=/portal/onboarding");
  }

  const { profile } = await getProfileById(user.id);
  const approved = await isApprovedMember(user.id);
  const applicationComplete = Boolean(profile?.onboarding_completed) || approved;

  return (
    <>
      <PageHeader
        kicker="Member onboarding"
        title="Onboarding"
        description="Three quick steps to finish joining AAIR Labs."
      />
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/portal"
          className="mb-10 inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to portal
        </Link>

        <div className="mb-8 space-y-3 text-sm leading-relaxed text-ink-70">
          <p>
            Welcome to AAIR Labs. Before you can publish and appear in the
            public directory, you{" "}
            <span className="font-semibold text-ink">
              must complete your membership application
            </span>
            . A director reviews every application and will accept or deny it.
          </p>
          <p>
            While you wait, get connected with the lab and check the events
            calendar for the next meeting. Work through the steps below.
          </p>
        </div>

        {approved && (
          <div className="mb-8">
            <Alert className="border-green bg-green-tint text-green">
              Your membership is approved. You&rsquo;re all set.
            </Alert>
          </div>
        )}

        <OnboardingChecklist applicationComplete={applicationComplete} />
      </section>
    </>
  );
}
