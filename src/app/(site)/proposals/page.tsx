import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";

import { PageHeader } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/dates";
import { getPublicProposals } from "@/lib/data/proposals";
import { proposalCategoryLabel } from "@/lib/proposal-categories";
import type { Proposal } from "@/lib/types";

export const instant = false;

export const metadata: Metadata = {
  title: "Current Research",
  description:
    "Approved research projects, whitepapers, and analysis projects from AAIR Labs.",
};

const PAGE_SIZE = 9;

function matches(proposal: Proposal, query: string) {
  const needle = query.toLowerCase();
  const haystack = [
    proposal.title,
    proposal.summary,
    proposalCategoryLabel(proposal.category),
    proposal.author?.full_name ?? "",
    proposal.author?.username ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export default async function ProposalsPage(props: PageProps<"/proposals">) {
  await connection();
  const search = await props.searchParams;
  const q = typeof search?.q === "string" ? search.q.trim() : "";
  const requestedPage = Number(
    typeof search?.page === "string" ? search.page : 1,
  );

  const all = await getPublicProposals();
  const filtered = q ? all.filter((proposal) => matches(proposal, q)) : all;

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(
    Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1),
    pageCount,
  );
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    return query ? `/proposals?${query}` : "/proposals";
  }

  return (
    <>
      <PageHeader
        kicker="Proposals"
        title="Current Research"
        description="Research projects, whitepapers, and analysis projects proposed by AAIR Labs members and approved by the Director of Research."
      >
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild size="sm">
            <Link href="/proposals/apply">
              Make a proposal
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/proposals/help">How proposals work</Link>
          </Button>
        </div>
      </PageHeader>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <form
          action="/proposals"
          method="get"
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-45" />
            <Input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search titles, summaries, or authors"
              aria-label="Search proposals"
              className="h-9 pl-9"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
          {q && (
            <Link
              href="/proposals"
              className="text-sm text-ink-70 underline underline-offset-4 hover:text-ink"
            >
              Clear search
            </Link>
          )}
        </form>

        <div className="mt-6 flex items-center justify-between gap-4 border-b border-line pb-4">
          <p className="text-sm text-ink-70">
            {all.length === 0
              ? "No proposals are listed yet."
              : q
                ? `${total} result${total === 1 ? "" : "s"} for "${q}"`
                : `${total} listed proposal${total === 1 ? "" : "s"}`}
          </p>
          {pageCount > 1 && (
            <p className="text-xs text-ink-45">
              Page {page} of {pageCount}
            </p>
          )}
        </div>

        {items.length > 0 && (
          <ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((proposal) => (
              <li key={proposal.id} className="flex">
                <article className="flex w-full flex-col gap-3 border border-line bg-surface p-6">
                  <div className="flex items-center justify-between gap-3">
                    <Badge
                      variant="outline"
                      className="rounded-[2px] uppercase"
                    >
                      {proposalCategoryLabel(proposal.category)}
                    </Badge>
                    <span className="text-xs text-ink-45">
                      {formatDate(proposal.created_at)}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl leading-snug">
                    <Link
                      href={`/proposals/${proposal.id}`}
                      className="hover:underline underline-offset-4"
                    >
                      {proposal.title}
                    </Link>
                  </h2>

                  <p className="line-clamp-3 text-sm leading-relaxed text-ink-70">
                    {proposal.summary}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
                    {proposal.author?.username ? (
                      <Link
                        href={`/researchers/${proposal.author.username}`}
                        className="text-xs text-ink-70 hover:text-ink"
                      >
                        {proposal.author.full_name || proposal.author.username}
                      </Link>
                    ) : (
                      <span className="text-xs text-ink-45">AAIR Labs</span>
                    )}
                    <Link
                      href={`/proposals/${proposal.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-ink hover:underline underline-offset-4"
                    >
                      View proposal
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}

        {items.length === 0 && all.length > 0 && (
          <div className="mt-6 border border-dashed border-line bg-surface px-6 py-16 text-center">
            <p className="font-serif text-2xl text-ink">No matching proposals</p>
            <p className="mt-2 text-sm text-ink-70">
              Try a different search, or browse the full list.
            </p>
          </div>
        )}

        {all.length === 0 && (
          <div className="mt-6 border border-dashed border-line bg-surface px-6 py-16 text-center">
            <p className="font-serif text-2xl text-ink">
              No proposals are listed yet
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-70">
              Approved proposals appear here. Members can submit a research
              project, whitepaper, or analysis project for director review.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="sm">
                <Link href="/proposals/apply">Make a proposal</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/proposals/help">Read the guidelines</Link>
              </Button>
            </div>
          </div>
        )}

        {pageCount > 1 && (
          <nav className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
              >
                <ArrowRight className="size-4 rotate-180" />
                Previous
              </Link>
            ) : (
              <span className="text-sm text-ink-45">Previous</span>
            )}
            {page < pageCount ? (
              <Link
                href={pageHref(page + 1)}
                className="inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
              >
                Next
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <span className="text-sm text-ink-45">Next</span>
            )}
          </nav>
        )}
      </section>
    </>
  );
}
