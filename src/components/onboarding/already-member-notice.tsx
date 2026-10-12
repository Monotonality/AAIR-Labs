import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AlreadyMemberNotice({
  username,
}: {
  username: string | null;
}) {
  return (
    <div className="mx-auto max-w-xl space-y-6 border border-line bg-surface p-6">
      <p className="text-sm leading-relaxed text-ink-70">
        You are already an approved member. Onboarding does not need to be
        submitted again.
      </p>
      <Button asChild>
        <Link href={username ? `/researchers/${username}` : "/portal"}>
          {username ? "View your page" : "Back to portal"}
        </Link>
      </Button>
    </div>
  );
}
