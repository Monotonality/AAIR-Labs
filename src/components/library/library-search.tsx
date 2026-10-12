"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PaperCard } from "@/components/library/paper-card";
import type { Project } from "@/lib/types";

export function LibrarySearch({ papers }: { papers: Project[] }) {
  const [query, setQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const domains = useMemo(() => {
    const set = new Set<string>();
    papers.forEach((p) => {
      if (p.target_domain) set.add(p.target_domain);
    });
    return Array.from(set).sort();
  }, [papers]);

  const authors = useMemo(() => {
    const set = new Set<string>();
    papers.forEach((p) => {
      if (p.author?.full_name) set.add(p.author.full_name);
    });
    return Array.from(set).sort();
  }, [papers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return papers.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.target_domain.toLowerCase().includes(q) ||
        (p.author?.full_name.toLowerCase().includes(q) ?? false);
      const matchesDomain =
        selectedDomain === "all" || p.target_domain === selectedDomain;
      const matchesAuthor =
        selectedAuthor === "all" || p.author?.full_name === selectedAuthor;
      return matchesQuery && matchesDomain && matchesAuthor;
    });
  }, [papers, query, selectedDomain, selectedAuthor]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left sidebar - Search and filters */}
      <aside className="w-full space-y-6 lg:w-80 lg:shrink-0">
        {/* Search */}
        <div className="space-y-3">
          <label htmlFor="library-search" className="text-sm font-semibold text-ink">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-45" />
            <Input
              id="library-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, authors, domains..."
              aria-label="Search the paper library"
              className="pl-9"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Filters</h3>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 text-xs text-ink-70 hover:text-ink lg:hidden"
            >
              {showFilters ? "Hide" : "Show"} filters
              <ChevronDown
                className={`size-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          <div className={`${showFilters ? "space-y-4" : "hidden space-y-4 lg:block"}`}>
            {/* Domain filter */}
            <div className="space-y-2">
              <label htmlFor="domain-filter" className="text-xs font-medium uppercase tracking-wide text-ink-50">
                Subject / Domain
              </label>
              <select
                id="domain-filter"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="h-9 w-full rounded-md border border-line bg-paper px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
              >
                <option value="all">All domains</option>
                {domains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>

            {/* Author filter */}
            <div className="space-y-2">
              <label htmlFor="author-filter" className="text-xs font-medium uppercase tracking-wide text-ink-50">
                Author
              </label>
              <select
                id="author-filter"
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="h-9 w-full rounded-md border border-line bg-paper px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
              >
                <option value="all">All authors</option>
                {authors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear filters */}
            {(query || selectedDomain !== "all" || selectedAuthor !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedDomain("all");
                  setSelectedAuthor("all");
                }}
                className="text-xs font-medium text-green hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Results count */}
          <p className="text-xs text-ink-45" aria-live="polite">
            {filtered.length} of {papers.length} item{papers.length === 1 ? "" : "s"}
          </p>
        </div>
      </aside>

      {/* Right section - Results */}
      <div className="flex-1 space-y-6">
        {filtered.length === 0 ? (
          <div className="border border-dashed border-line bg-surface px-6 py-16 text-center">
            <p className="font-serif text-2xl text-ink">No papers found</p>
            <p className="mt-2 text-sm text-ink-70">
              Try adjusting your search or filters to find what you are looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((paper) => (
              <PaperCard key={paper.id} project={paper} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}