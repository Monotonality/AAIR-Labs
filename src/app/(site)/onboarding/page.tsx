import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/section-heading";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Onboarding",
};

export default function OnboardingPage() {
  return (
    <>
      <PageHeader
        kicker="Member onboarding"
        title="Join the lab in three steps"
        description="Apply, learn how the org runs, then set up your affiliate branding and research portfolio."
      />
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <OnboardingWizard />
      </section>
    </>
  );
}