import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/section-heading";
import { LibrarySearch } from "@/components/library/library-search";
import { getPublishedPapers } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Public Library",
};

export default async function LibraryPage() {
  const papers = await getPublishedPapers();

  return (
    <>
      <PageHeader
        kicker="Public library"
        title="Whitepapers & technical frameworks"
        description="Every published paper here passed director approval and peer review. Each entry links back to its author's portfolio."
      />
      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-12 sm:px-6">
        <LibrarySearch papers={papers} />
      </section>
    </>
  );
}