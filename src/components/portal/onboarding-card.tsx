"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getTodosServerSnapshot,
  getTodosSnapshot,
  parseTodos,
  subscribeTodos,
} from "@/lib/onboarding-todos";

export function OnboardingCard({
  applicationComplete,
}: {
  applicationComplete: boolean;
}) {
  const snapshot = useSyncExternalStore(
    subscribeTodos,
    getTodosSnapshot,
    getTodosServerSnapshot,
  );
  const todos = useMemo(() => parseTodos(snapshot), [snapshot]);
  const allDone = applicationComplete && todos.connected && todos.events;

  return (
    <div className="flex flex-col gap-4 border border-line bg-surface p-6">
      <ListChecks className="size-5 text-ink" />
      <h2 className="font-serif text-2xl">Onboarding</h2>
      <p className="text-sm leading-relaxed text-ink-70">
        Work through the steps to complete your application and get connected
        with the lab.
      </p>
      <div className="mt-auto">
        <Button asChild size="sm" variant="secondary">
          <Link href="/portal/onboarding">
            {allDone ? "View onboarding" : "Start onboarding"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
