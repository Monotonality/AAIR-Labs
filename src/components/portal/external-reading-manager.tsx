"use client";

import { useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteExternalReading,
  saveExternalReading,
} from "@/lib/actions/external-readings";
import type { ExternalReading, ExternalReadingInput } from "@/lib/types";

const EMPTY_FORM: ExternalReadingInput = {
  title: "",
  authors: "",
  venue: "",
  published_year: "",
  source_url: "",
  context: "",
};

export function ExternalReadingManager({
  readings,
}: {
  readings: ExternalReading[];
}) {
  const [form, setForm] = useState<ExternalReadingInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const editing = Boolean(form.id);

  function update<K extends keyof ExternalReadingInput>(
    key: K,
    value: ExternalReadingInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function editReading(reading: ExternalReading) {
    setError(null);
    setForm({
      id: reading.id,
      title: reading.title,
      authors: reading.authors,
      venue: reading.venue ?? "",
      published_year: reading.published_year ? String(reading.published_year) : "",
      source_url: reading.source_url,
      context: reading.context,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPendingId(form.id ?? "new");
    startTransition(async () => {
      const result = await saveExternalReading(form);
      if (!result.ok) setError(result.error);
      else setForm(EMPTY_FORM);
      setPendingId(null);
    });
  }

  function onDelete(id: string) {
    if (!window.confirm("Remove this external reading from the public library?")) {
      return;
    }
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await deleteExternalReading(id);
      if (!result.ok) setError(result.error);
      else if (form.id === id) setForm(EMPTY_FORM);
      setPendingId(null);
    });
  }

  const saving = isPending && pendingId === (form.id ?? "new");

  return (
    <div className="space-y-10">
      {error && <Alert variant="destructive">{error}</Alert>}

      <form
        onSubmit={onSubmit}
        className="space-y-5 border border-line bg-surface p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl">
            {editing ? "Revise external reading" : "Add external reading"}
          </h2>
          {editing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setForm(EMPTY_FORM)}
            >
              Cancel edit
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="reading-title">Title</Label>
            <Input
              id="reading-title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
              maxLength={300}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reading-authors">Original authors</Label>
            <Input
              id="reading-authors"
              value={form.authors}
              onChange={(e) => update("authors", e.target.value)}
              required
              maxLength={500}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reading-venue">Venue</Label>
            <Input
              id="reading-venue"
              value={form.venue}
              onChange={(e) => update("venue", e.target.value)}
              placeholder="Journal, conference, or site"
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reading-year">Year</Label>
            <Input
              id="reading-year"
              inputMode="numeric"
              value={form.published_year}
              onChange={(e) => update("published_year", e.target.value)}
              placeholder="2024"
              maxLength={4}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reading-url">Source URL</Label>
            <Input
              id="reading-url"
              inputMode="url"
              value={form.source_url}
              onChange={(e) => update("source_url", e.target.value)}
              placeholder="https://"
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="reading-context">Context</Label>
            <Textarea
              id="reading-context"
              rows={6}
              value={form.context}
              onChange={(e) => update("context", e.target.value)}
              required
              maxLength={4000}
              placeholder="Why this work matters to AAIR Labs, and how members should read it."
            />
            <p className="text-xs text-ink-45">
              Visitors see this note beside the source. It does not make the
              work an AAIR Labs publication.
            </p>
          </div>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : editing ? "Save revision" : "Add to library"}
        </Button>
      </form>

      <div className="space-y-4">
        <h2 className="font-serif text-2xl">External reading</h2>
        {readings.length === 0 ? (
          <div className="border border-dashed border-line bg-surface px-6 py-12 text-center">
            <p className="text-sm text-ink-70">
              Nothing here yet. Add a source and a context note above.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line border border-line bg-surface">
            {readings.map((reading) => {
              const busy = isPending && pendingId === reading.id;
              return (
                <li
                  key={reading.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{reading.title}</p>
                    <p className="mt-0.5 text-sm text-ink-70">
                      {reading.authors}
                      {reading.venue ? ` · ${reading.venue}` : ""}
                      {reading.published_year ? ` · ${reading.published_year}` : ""}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-70">
                      {reading.context}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => editReading(reading)}
                    >
                      Revise
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => onDelete(reading.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
