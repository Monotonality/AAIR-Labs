"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  removeMember,
  setMemberAdmin,
  setMemberTitle,
} from "@/lib/actions/members";
import type { Profile } from "@/lib/types";

const ROLE_LABEL: Record<Profile["role"], string> = {
  guest: "Guest",
  student: "Member",
  director: "Admin",
  faculty: "Faculty",
};

type ActionResult = { ok: boolean; error?: string };

function displayName(profile: Profile) {
  return (
    profile.full_name || profile.username || profile.email || "Unnamed member"
  );
}

function MemberRow({
  profile,
  currentUserId,
}: {
  profile: Profile;
  currentUserId: string;
}) {
  const [title, setTitle] = useState(profile.title ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isSelf = profile.id === currentUserId;
  const isAdmin = profile.role === "director";
  const titleChanged = title.trim() !== (profile.title ?? "");

  function run(action: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? "Something went wrong.");
    });
  }

  return (
    <li className="border border-line bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-serif text-2xl leading-tight">
            {displayName(profile)}
            {isSelf && <span className="ml-2 text-sm text-ink-45">(you)</span>}
          </h2>
          {profile.email && (
            <p className="text-sm text-ink-70">{profile.email}</p>
          )}
          {profile.username && (
            <p className="text-xs text-ink-45">@{profile.username}</p>
          )}
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            isAdmin ? "bg-ink text-paper" : "bg-line/40 text-ink-70"
          }`}
        >
          {ROLE_LABEL[profile.role]}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-5">
        <div className="space-y-1.5">
          <Label htmlFor={`title-${profile.id}`}>Title</Label>
          <Input
            id={`title-${profile.id}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Member"
            className="w-56"
          />
        </div>
        <Button
          size="sm"
          variant="secondary"
          disabled={isPending || !titleChanged}
          onClick={() => run(() => setMemberTitle(profile.id, title))}
        >
          Save title
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={isPending || (isSelf && isAdmin)}
          onClick={() => run(() => setMemberAdmin(profile.id, !isAdmin))}
        >
          {isAdmin ? "Remove admin" : "Make admin"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={isPending || isSelf}
          onClick={() => {
            if (
              !window.confirm(
                `Remove ${displayName(profile)}? This permanently deletes their account.`,
              )
            ) {
              return;
            }
            run(() => removeMember(profile.id));
          }}
        >
          Remove account
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </li>
  );
}

export function MembersManager({
  members,
  currentUserId,
}: {
  members: Profile[];
  currentUserId: string;
}) {
  if (members.length === 0) {
    return (
      <div className="border border-dashed border-line bg-surface px-6 py-16 text-center">
        <p className="font-serif text-2xl text-ink">No members yet</p>
        <p className="mt-2 text-sm text-ink-70">
          Profiles appear here once people create an account.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {members.map((profile) => (
        <MemberRow
          key={profile.id}
          profile={profile}
          currentUserId={currentUserId}
        />
      ))}
    </ul>
  );
}
