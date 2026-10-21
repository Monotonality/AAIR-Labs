"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateProjectDetails } from "@/lib/actions/projects";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PROPOSAL_CATEGORY_CONFIG,
  PROPOSAL_CATEGORY_VALUES,
} from "@/lib/proposal-categories";
import type { Project, ProposalCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProjectDetailsFormProps {
  project: Project;
  isDirector: boolean;
}

function toListText(values: string[] | null | undefined): string {
  return (values ?? []).join("\n");
}

export function ProjectDetailsForm({ project, isDirector }: ProjectDetailsFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [abstract, setAbstract] = useState(project.abstract);
  const [targetDomain, setTargetDomain] = useState(project.target_domain ?? "");
  const [topics, setTopics] = useState(toListText(project.topics));
  const [geographicScope, setGeographicScope] = useState(toListText(project.geographic_scope));
  const [methodology, setMethodology] = useState(toListText(project.methodology));
  const [dataSources, setDataSources] = useState(toListText(project.data_sources));
  const [category, setCategory] = useState<ProposalCategory>(project.category);

  const resubmits = !isDirector && project.status === "rejected";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      title,
      abstract,
      target_domain: targetDomain,
      topics,
      geographic_scope: geographicScope,
      methodology,
      data_sources: dataSources,
      ...(isDirector ? { category } : {}),
    };

    const result = await updateProjectDetails(project.id, payload);
    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push(`/projects/${project.id}`);
    router.refresh();
  }

  const listFields = [
    {
      key: "topics",
      label: "Topics",
      value: topics,
      setValue: setTopics,
      placeholder: "Real Estate Economics\nHousing Policy",
    },
    {
      key: "geographic-scope",
      label: "Geographic scope",
      value: geographicScope,
      setValue: setGeographicScope,
      placeholder: "United States",
    },
    {
      key: "methodology",
      label: "Methodology",
      value: methodology,
      setValue: setMethodology,
      placeholder: "Panel Regression\nDifference-in-Differences",
    },
    {
      key: "data-sources",
      label: "Data sources",
      value: dataSources,
      setValue: setDataSources,
      placeholder: "Zillow, US Census",
    },
  ] as const;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-[2px] border border-line bg-surface p-6"
    >
      {error && <Alert variant="destructive">{error}</Alert>}

      <fieldset className="space-y-3">
        <legend className="font-serif text-xl">Project type</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PROPOSAL_CATEGORY_VALUES.map((value) => {
            const option = PROPOSAL_CATEGORY_CONFIG[value];
            const selected = category === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                disabled={!isDirector || isSubmitting}
                onClick={() => setCategory(value)}
                className={cn(
                  "flex h-full flex-col items-start gap-1 rounded-[2px] border p-4 text-left transition-colors",
                  selected
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper text-ink hover:border-ink/60",
                  (!isDirector || isSubmitting) && "cursor-not-allowed opacity-70",
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
        {!isDirector && (
          <p className="text-xs text-ink-45">
            The project type is set when a director creates the project; ask a
            director if it needs to change.
          </p>
        )}
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="project-title">Title</Label>
        <Input
          id="project-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="project-abstract">Description</Label>
        <Textarea
          id="project-abstract"
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          rows={5}
          maxLength={4000}
          required
          disabled={isSubmitting}
        />
        <p className="text-xs text-ink-45">
          What the project studies, how, and what it will produce.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="project-target-domain">Target domain</Label>
        <Input
          id="project-target-domain"
          value={targetDomain}
          onChange={(e) => setTargetDomain(e.target.value)}
          placeholder="Real Estate Economics"
          maxLength={200}
          disabled={isSubmitting}
        />
      </div>

      <fieldset className="space-y-5 border-t border-line pt-6">
        <legend className="font-serif text-xl">Library metadata</legend>
        <p className="text-sm text-ink-70">
          One item per line. This is how the project is described and filtered
          in the library once it is approved.
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {listFields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={`project-${field.key}`}>{field.label}</Label>
              <Textarea
                id={`project-${field.key}`}
                value={field.value}
                onChange={(e) => field.setValue(e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                maxLength={2000}
                disabled={isSubmitting}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <p className="max-w-lg text-xs leading-relaxed text-ink-45">
          {resubmits
            ? "Saving sends the project back to the Director of Research for another review."
            : "Changes take effect immediately. Approved projects are locked until a director reopens them."}
        </p>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : resubmits
              ? "Save and resubmit"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
