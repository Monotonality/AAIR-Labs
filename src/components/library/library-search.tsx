"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PaperCard } from "@/components/library/paper-card";
import type { Project } from "@/lib/types";

export function LibrarySearch({ papers }: { papers: Project[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return papers;
    return papers.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.target_domain.toLowerCase().includes(q) ||
        (p.author?.full_name.toLowerCase().includes(q) ?? false),
    );
  }, [papers, query]);

  return (
    <>
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-45" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles, authors, domains…"
          aria-label="Search the paper library"
          className="pl-9"
        />
      </div>

      <p className="text-xs text-ink-45" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "paper" : "papers"}
      </p>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-line bg-surface px-6 py-16 text-center">
          <p className="font-serif text-2xl text-ink">No papers found</p>
          <p className="mt-2 text-sm text-ink-70">
            Try a broader term, or check back after the next publication cycle.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((paper) => (
            <PaperCard key={paper.id} project={paper} />
          ))}
        </div>
      )}
    </>
  );
}