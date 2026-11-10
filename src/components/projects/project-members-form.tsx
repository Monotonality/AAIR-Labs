"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { setProjectMembers } from "@/lib/actions/projects";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Profile, Project } from "@/lib/types";
import { cn } from "@/lib/utils";

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-line bg-paper px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20";

interface ProjectMembersFormProps {
  project: Project;
  members: Profile[];
  /** Directors may also change the lead. */
  isDirector: boolean;
  disabled?: boolean;
}

function memberLabel(profile: Profile) {
  return profile.full_name || profile.username || profile.email || "Member";
}

export function ProjectMembersForm({
  project,
  members,
  isDirector,
  disabled = false,
}: ProjectMembersFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadId, setLeadId] = useState(project.author_id);
  const [coAuthorIds, setCoAuthorIds] = useState<string[]>(
    (project.co_authors ?? [])
      .filter((row) => row.role === "co_author")
      .sort((a, b) => a.position - b.position)
      .map((row) => row.profile_id),
  );

  // Keep current team members in the list even if they no longer appear in
  // the member directory (e.g. onboarding was reset).
  const known = new Map(members.map((m) => [m.id, m]));
  for (const row of project.co_authors ?? []) {
    if (row.profile && !known.has(row.profile_id)) known.set(row.profile_id, row.profile);
  }
  if (project.author && !known.has(project.author_id)) {
    known.set(project.author_id, project.author);
  }
  const everyone = [...known.values()].sort((a, b) =>
    memberLabel(a).localeCompare(memberLabel(b)),
  );
  const candidates = everyone.filter((m) => m.id !== leadId);
  const locked = disabled || isSubmitting;

  function toggle(profileId: string) {
    setSaved(false);
    setCoAuthorIds((prev) =>
      prev.includes(profileId) ? prev.filter((id) => id !== profileId) : [...prev, profileId],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setIsSubmitting(true);
    const result = await setProjectMembers(project.id, {
      ...(isDirector ? { lead_id: leadId } : {}),
      co_author_ids: coAuthorIds.filter((id) => id !== leadId),
    });
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-[2px] border border-line bg-surface p-6"
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-45">
          Team
        </p>
        <h2 className="mt-1 font-serif text-2xl">Project members</h2>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}
      {saved && <Alert>Team saved.</Alert>}

      {isDirector ? (
        <div className="space-y-1.5">
          <Label htmlFor="project-lead">Lead researcher</Label>
          <select
            id="project-lead"
            value={leadId}
            onChange={(e) => {
              setSaved(false);
              setLeadId(e.target.value);
            }}
            disabled={locked}
            className={SELECT_CLASS}
          >
            {everyone.map((member) => (
              <option key={member.id} value={member.id}>
                {memberLabel(member)}
              </option>
            ))}
          </select>
          <p className="text-xs text-ink-45">
            Only directors can change the lead. The previous lead stays on the
            team only if you tick them below.
          </p>
        </div>
      ) : (
        <p className="text-sm text-ink-70">
          You are the lead. Choose who else is on this project. Co-authors can
          read everything but cannot edit or submit.
        </p>
      )}

      {candidates.length === 0 ? (
        <p className="text-xs text-ink-45">No other members to choose from.</p>
      ) : (
        <fieldset className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
          <legend className="sr-only">Co-authors</legend>
          {candidates.map((member) => {
            const checked = coAuthorIds.includes(member.id);
            return (
              <label
                key={member.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-[2px] border p-3 text-sm transition-colors",
                  checked
                    ? "border-ink bg-paper text-ink"
                    : "border-line bg-surface text-ink-70 hover:border-ink/60",
                  locked && "cursor-not-allowed opacity-70",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(member.id)}
                  disabled={locked}
                  className="size-4 accent-current"
                />
                {memberLabel(member)}
              </label>
            );
          })}
        </fieldset>
      )}

      <div className="flex justify-end border-t border-line pt-5">
        <Button type="submit" disabled={locked}>
          {isSubmitting ? "Saving..." : "Save team"}
        </Button>
      </div>
    </form>
  );
}
