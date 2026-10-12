import type { Metadata } from "next";
import { connection } from "next/server";

import { AlreadyMemberNotice } from "@/components/onboarding/already-member-notice";
import { PageHeader } from "@/components/shared/section-heading";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { getProfileById, isApprovedMember } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Onboarding",
};

export default async function OnboardingPage() {
  await connection();
  const user = await getAuthenticatedUser();
  const signedIn = Boolean(user);
  const approved = user ? await isApprovedMember(user.id) : false;
  const profile = approved && user ? (await getProfileById(user.id)).profile : null;

  return (
    <>
      <PageHeader
        kicker="Member onboarding"
        title={
          approved
            ? "Membership approved"
            : signedIn
              ? "Join the lab in two steps"
              : "Create account & get connected"
        }
        description={
          approved
            ? "Your membership application has already been approved."
            : signedIn
              ? "Apply and get connected."
              : "Create your account, apply, and get connected."
        }
      />
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        {approved ? (
          <AlreadyMemberNotice username={profile?.username ?? null} />
        ) : (
          <OnboardingWizard signedIn={signedIn} />
        )}
      </section>
    </>
  );
}