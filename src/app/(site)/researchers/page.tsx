import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/section-heading";
import { ResearcherCard } from "@/components/researchers/researcher-card";
import { getResearchers } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Researchers",
};

export default async function ResearchersPage() {
  const researchers = await getResearchers();

  return (
    <>
      <PageHeader
        kicker="Members"
        title="The AAIR Labs Roster"
        description="Onboarded members and their public researcher portfolios."
      />
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        {researchers.length === 0 ? (
          <div className="border border-dashed border-line bg-surface px-6 py-16 text-center">
            <p className="font-serif text-2xl text-ink">No members yet</p>
            <p className="mt-2 text-sm text-ink-70">
              Portfolios appear here as members complete onboarding.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {researchers.map((profile) => (
              <ResearcherCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}