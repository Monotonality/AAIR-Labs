"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createProject } from "@/lib/actions/projects";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PROPOSAL_CATEGORY_CONFIG,
  PROPOSAL_CATEGORY_VALUES,
} from "@/lib/proposal-categories";
import type { Profile, Proposal, ProposalCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-line bg-paper px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20";

interface ProjectCreateFormProps {
  proposals: Proposal[];
  members: Profile[];
}

function memberLabel(profile: Profile) {
  return profile.full_name || profile.username || profile.email || "Member";
}

export function ProjectCreateForm({ proposals, members }: ProjectCreateFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposalId, setProposalId] = useState("");
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [category, setCategory] = useState<ProposalCategory>("research");
  const [targetDomain, setTargetDomain] = useState("");
  const [leadId, setLeadId] = useState("");
  const [coAuthorIds, setCoAuthorIds] = useState<string[]>([]);

  function onProposalChange(value: string) {
    setProposalId(value);
    const proposal = proposals.find((p) => p.id === value);
    if (proposal) {
      setTitle(proposal.title);
      setAbstract(proposal.summary);
      setCategory(proposal.category);
    }
  }

  function toggleCoAuthor(profileId: string) {
    setCoAuthorIds((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await createProject({
      proposal_id: proposalId,
      title,
      abstract,
      category,
      target_domain: targetDomain,
      lead_id: leadId,
      co_author_ids: coAuthorIds,
    });

    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push(`/projects/${result.id}`);
    router.refresh();
  }

  const coAuthorCandidates = members.filter((m) => m.id !== leadId);

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-[2px] border border-line bg-surface p-6"
    >
      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="space-y-1.5">
        <Label htmlFor="project-proposal">Source proposal</Label>
        <select
          id="project-proposal"
          value={proposalId}
          onChange={(e) => onProposalChange(e.target.value)}
          disabled={isSubmitting}
          className={SELECT_CLASS}
        >
          <option value="">Start from a blank project</option>
          {proposals.map((proposal) => (
            <option key={proposal.id} value={proposal.id}>
              {proposal.title}
            </option>
          ))}
        </select>
        <p className="text-xs text-ink-45">
          {proposals.length === 0
            ? "No approved proposals are available to link."
            : "Choosing an approved proposal prefills the title, description, and type."}
        </p>
      </div>

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
                disabled={isSubmitting}
                onClick={() => setCategory(value)}
                className={cn(
                  "flex h-full flex-col items-start gap-1 rounded-[2px] border p-4 text-left transition-colors",
                  selected
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper text-ink hover:border-ink/60",
                  isSubmitting && "cursor-not-allowed opacity-70",
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
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="project-title">Title</Label>
        <Input
          id="project-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="The title of the project"
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
          placeholder="What the project studies, how, and what it will produce."
          rows={5}
          maxLength={4000}
          required
          disabled={isSubmitting}
        />
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

      <div className="space-y-1.5">
        <Label htmlFor="project-lead">Lead researcher</Label>
        <select
          id="project-lead"
          value={leadId}
          onChange={(e) => {
            setLeadId(e.target.value);
            setCoAuthorIds((prev) => prev.filter((id) => id !== e.target.value));
          }}
          required
          disabled={isSubmitting}
          className={SELECT_CLASS}
        >
          <option value="">Choose a member</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {memberLabel(member)}
            </option>
          ))}
        </select>
        <p className="text-xs text-ink-45">
          The lead researcher edits the details and uploads working-paper
          versions.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="font-serif text-xl">Co-authors</legend>
        <p className="text-sm text-ink-70">
          Optional. Co-authors can open the project and read everything,
          including uploaded versions, but they cannot edit or upload.
        </p>
        {coAuthorCandidates.length === 0 ? (
          <p className="text-xs text-ink-45">No other members to choose from.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {coAuthorCandidates.map((member) => {
              const checked = coAuthorIds.includes(member.id);
              return (
                <label
                  key={member.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-[2px] border p-3 text-sm transition-colors",
                    checked
                      ? "border-ink bg-paper text-ink"
                      : "border-line bg-surface text-ink-70 hover:border-ink/60",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCoAuthor(member.id)}
                    disabled={isSubmitting}
                    className="size-4 accent-current"
                  />
                  {memberLabel(member)}
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <p className="max-w-lg text-xs leading-relaxed text-ink-45">
          The project starts as pending. The team then uploads the working
          paper, and directors approve or deny it from the review queue.
        </p>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create project"}
        </Button>
      </div>
    </form>
  );
}
