import type { Metadata } from "next";
import { connection } from "next/server";

import { ExternalReadingList } from "@/components/library/external-reading-list";
import { LibrarySearch } from "@/components/library/library-search";
import { getExternalReadings, getPublishedPapers } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Public Library",
};

export default async function LibraryPage() {
  await connection();
  const [papers, readings] = await Promise.all([
    getPublishedPapers(),
    getExternalReadings(),
  ]);

  return (
    <>
      <div className="border-b border-line bg-paper">
        <div className="mx-auto w-full max-w-6xl px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
            Publications
          </p>
          <h1 className="font-serif text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
            Papers & External Reading
          </h1>
        </div>
      </div>
      <section className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12 sm:px-6">
        <LibrarySearch papers={papers} />
        <ExternalReadingList readings={readings} />
      </section>
    </>
  );
}