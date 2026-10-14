"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  FolderOpen,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  type ManualTodoState,
  getTodosServerSnapshot,
  getTodosSnapshot,
  parseTodos,
  setTodo,
  subscribeTodos,
} from "@/lib/onboarding-todos";

interface TodoItem {
  key: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  icon: LucideIcon;
  locked?: boolean;
}

const ITEMS: TodoItem[] = [
  {
    key: "application",
    title: "Complete your membership application",
    description:
      "Submit or update your application. A director reviews every application and accepts or denies it.",
    href: "/profile/application",
    linkLabel: "Open application",
    icon: ListChecks,
    locked: true,
  },
  {
    key: "connected",
    title: "Get connected with the lab",
    description:
      "Join the GroupMe and follow AAIR Labs on Instagram and LinkedIn. Banners and a LinkedIn tutorial are in Resources.",
    href: "/portal/resources",
    linkLabel: "Open resources",
    icon: FolderOpen,
  },
  {
    key: "events",
    title: "Check the events calendar",
    description:
      "Look at the calendar for the next workshop or general meeting and plan to attend.",
    href: "/events",
    linkLabel: "View events",
    icon: CalendarDays,
  },
];

const MANUAL_KEYS: Record<string, keyof ManualTodoState> = {
  connected: "connected",
  events: "events",
};

export function OnboardingChecklist({
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

  function isChecked(key: string) {
    if (key === "application") return applicationComplete;
    const manual = MANUAL_KEYS[key];
    return manual ? todos[manual] : false;
  }

  function toggle(key: string) {
    const manual = MANUAL_KEYS[key];
    if (!manual) return;
    setTodo(manual, !todos[manual]);
  }

  const completed = ITEMS.filter((item) => isChecked(item.key)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border border-line bg-surface px-5 py-4">
        <p className="text-sm font-semibold text-ink">
          {completed} of {ITEMS.length} steps complete
        </p>
        <div className="h-1.5 w-32 overflow-hidden bg-paper-deep">
          <div
            className="h-full bg-ink transition-all"
            style={{ width: `${(completed / ITEMS.length) * 100}%` }}
          />
        </div>
      </div>

      <ul className="space-y-3">
        {ITEMS.map((item) => {
          const done = isChecked(item.key);
          const Icon = item.icon;
          return (
            <li
              key={item.key}
              className="flex flex-col gap-4 border border-line bg-surface p-5 sm:flex-row sm:items-start"
            >
              <button
                type="button"
                disabled={item.locked}
                onClick={() => toggle(item.key)}
                aria-pressed={done}
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-[2px] border transition-colors",
                  done
                    ? "border-green bg-green text-paper"
                    : "border-ink/40 bg-surface text-transparent",
                  item.locked ? "cursor-default" : "hover:border-ink",
                )}
              >
                <Check className="size-3.5" />
                <span className="sr-only">
                  {done ? "Complete" : "Incomplete"}: {item.title}
                </span>
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-ink-45" />
                  <h3
                    className={cn(
                      "font-serif text-xl text-ink",
                      done && "opacity-60",
                    )}
                  >
                    {item.title}
                  </h3>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-70">
                  {item.description}
                </p>
                <Link
                  href={item.href}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-green"
                >
                  {item.linkLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              {item.locked && (
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-45">
                  {done ? "Submitted" : "Action needed"}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
