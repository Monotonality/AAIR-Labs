"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

import { createProposal, updateProposal } from "@/lib/actions/proposals";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PROPOSAL_CATEGORY_CONFIG,
  PROPOSAL_CATEGORY_VALUES,
} from "@/lib/proposal-categories";
import type { Proposal, ProposalCategory, ProposalReference } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryValues = Record<string, string>;
type DetailsDraft = Record<string, string | ProposalReference[]>;

function emptyValues(): Record<ProposalCategory, CategoryValues> {
  return {
    research: {},
    whitepaper: {},
    analysis: {},
  };
}

function valuesForCategory(
  values: Record<ProposalCategory, CategoryValues>,
  category: ProposalCategory,
  fallback: CategoryValues = {},
): CategoryValues {
  const config = PROPOSAL_CATEGORY_CONFIG[category];
  const source = values[category] ?? {};
  const next: CategoryValues = {};
  for (const field of config.fields) {
    next[field.key] = String(source[field.key] ?? fallback[field.key] ?? "");
  }
  return next;
}

interface ProposalFormProps {
  mode: "create" | "edit";
  proposal?: Proposal;
}

export function ProposalForm({ mode, proposal }: ProposalFormProps) {
  const router = useRouter();
  const initialCategory = proposal?.category ?? null;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(proposal?.title ?? "");
  const [summary, setSummary] = useState(proposal?.summary ?? "");
  const [category, setCategory] = useState<ProposalCategory | null>(
    initialCategory,
  );
  const [values, setValues] = useState<Record<
    ProposalCategory,
    CategoryValues
  >>(() => {
    const next = emptyValues();
    if (proposal) {
      next[proposal.category] = valuesForCategory(
        next,
        proposal.category,
        proposal.details as unknown as CategoryValues,
      );
    }
    return next;
  });
  const [priorWorks, setPriorWorks] = useState<ProposalReference[]>(
    proposal?.details?.priorWorks ?? [],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!category) {
      setError("Choose a proposal category before submitting.");
      return;
    }

    setIsSubmitting(true);
    const details: DetailsDraft = { ...values[category] };
    details.priorWorks = priorWorks.filter(
      (work) => work.title.trim() || work.url.trim(),
    );

    const payload = { category, title, summary, details };
    const result =
      mode === "edit" && proposal
        ? await updateProposal(proposal.id, payload)
        : await createProposal(payload);

    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push(`/proposals/${result.id}`);
    router.refresh();
  }

  function setValue(fieldKey: string, value: string) {
    if (!category) return;
    setValues((prev) => ({
      ...prev,
      [category]: { ...prev[category], [fieldKey]: value },
    }));
  }

  function updatePriorWork(index: number, patch: Partial<ProposalReference>) {
    setPriorWorks((prev) =>
      prev.map((work, i) => (i === index ? { ...work, ...patch } : work)),
    );
  }

  const config = category ? PROPOSAL_CATEGORY_CONFIG[category] : null;
  const categoryValues = category ? values[category] : {};

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-[2px] border border-line bg-surface p-6"
    >
      {error && <Alert variant="destructive">{error}</Alert>}

      <fieldset className="space-y-3">
        <legend className="font-serif text-xl">Proposal category</legend>
        <p className="text-sm text-ink-70">
          The category decides the questions below and how directors review the
          proposal.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PROPOSAL_CATEGORY_VALUES.map((value) => {
            const option = PROPOSAL_CATEGORY_CONFIG[value];
            const selected = category === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                disabled={mode === "edit"}
                onClick={() => setCategory(value)}
                className={cn(
                  "flex h-full flex-col items-start gap-1 rounded-[2px] border p-4 text-left transition-colors",
                  selected
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper text-ink hover:border-ink/60",
                  mode === "edit" && "cursor-not-allowed opacity-70",
                )}
              >
                <span className="font-serif text-lg">{option.label}</span>
                <span
                  className={cn(
                    "text-xs leading-relaxed",
                    selected ? "text-paper/80" : "text-ink-70",
                  )}
                >
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
        {mode === "edit" && category && (
          <p className="text-xs text-ink-45">
            The category is fixed after submission. Reach out to a director if
            it needs to change.
          </p>
        )}
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="proposal-title">Title</Label>
        <Input
          id="proposal-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="The title of your proposal"
          maxLength={200}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proposal-summary">Summary</Label>
        <Textarea
          id="proposal-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Two or three sentences describing the question, the approach, and the expected outcome."
          rows={4}
          maxLength={2000}
          required
          disabled={isSubmitting}
        />
        <p className="text-xs text-ink-45">
          This summary appears on the public proposal list.
        </p>
      </div>

      {config && (
        <fieldset className="space-y-5 border-t border-line pt-6">
          <legend className="font-serif text-xl">
            {config.label} requirements
          </legend>
          {config.fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={`proposal-${field.key}`}>{field.label}</Label>
              <p className="text-xs leading-relaxed text-ink-70">
                {field.prompt}
              </p>
              <Textarea
                id={`proposal-${field.key}`}
                value={categoryValues[field.key] ?? ""}
                onChange={(e) => setValue(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows ?? 4}
                maxLength={4000}
                required
                disabled={isSubmitting}
              />
            </div>
          ))}
        </fieldset>
      )}

      <fieldset className="space-y-4 border-t border-line pt-6">
        <legend className="font-serif text-xl">Prior work</legend>
        <p className="text-sm text-ink-70">
          Optional. Link papers, code, datasets, or writing that this proposal
          builds on. Each reference needs a title and a URL; there is no limit
          on the number of references.
        </p>
        <div className="space-y-3">
          {priorWorks.map((work, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-3 rounded-[2px] border border-line bg-paper p-4 sm:grid-cols-[1fr_1fr_auto]"
            >
              <div className="space-y-1.5">
                <Label htmlFor={`prior-title-${index}`}>Reference title</Label>
                <Input
                  id={`prior-title-${index}`}
                  value={work.title}
                  onChange={(e) =>
                    updatePriorWork(index, { title: e.target.value })
                  }
                  placeholder="Attention Is All You Need"
                  maxLength={200}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`prior-url-${index}`}>URL</Label>
                <Input
                  id={`prior-url-${index}`}
                  type="url"
                  value={work.url}
                  onChange={(e) =>
                    updatePriorWork(index, { url: e.target.value })
                  }
                  placeholder="https://arxiv.org/abs/1706.03762"
                  maxLength={2000}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setPriorWorks((prev) => prev.filter((_, i) => i !== index))
                  }
                  disabled={isSubmitting}
                  aria-label={`Remove ${work.title || "reference"}`}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setPriorWorks((prev) => [...prev, { title: "", url: "" }])
          }
          disabled={isSubmitting}
        >
          <Plus className="size-4" />
          Add reference
        </Button>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <p className="max-w-lg text-xs leading-relaxed text-ink-45">
          {mode === "edit"
            ? "Resubmitting sends the proposal back to the Director of Research for another review."
            : "Submitted proposals are reviewed for completeness and fit with the lab direction before they appear publicly."}
        </p>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "edit"
              ? "Saving..."
              : "Submitting..."
            : mode === "edit"
              ? "Save and resubmit"
              : "Submit proposal"}
        </Button>
      </div>
    </form>
  );
}
