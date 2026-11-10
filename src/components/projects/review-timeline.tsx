import { CheckCircle2, FileUp, MessageSquare, RotateCcw, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { LocalTime } from "@/components/projects/local-time";
import { draftStageLabel } from "@/lib/papers";
import type { ProjectEventKind, ProjectReviewEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const KIND_CONFIG: Record<
  ProjectEventKind,
  { label: string; icon: LucideIcon; tone: string }
> = {
  submitted: { label: "Submitted", icon: FileUp, tone: "text-ink" },
  approved: { label: "Approved and published", icon: CheckCircle2, tone: "text-green" },
  denied: { label: "Denied", icon: XCircle, tone: "text-destructive" },
  comment: { label: "Director comment", icon: MessageSquare, tone: "text-ink" },
  reopened: { label: "Reopened for changes", icon: RotateCcw, tone: "text-ink" },
};

export function ReviewTimeline({ events }: { events: ProjectReviewEvent[] }) {
  return (
    <section className="rounded-[2px] border border-line bg-surface p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-45">
        Review history
      </p>
      <h2 className="mt-1 font-serif text-2xl">Submissions and feedback</h2>

      {events.length === 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-70">
          Nothing yet. Submissions, director decisions, and comments will be
          listed here.
        </p>
      ) : (
        <ol className="mt-5 space-y-5 border-l border-line pl-5">
          {events.map((event) => {
            const config = KIND_CONFIG[event.kind];
            const Icon = config.icon;
            const stage = draftStageLabel(event.stage);
            const detail = [
              stage,
              event.draft_version ? `v${event.draft_version}` : null,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={event.id} className="relative">
                <span className="absolute -left-[29px] top-0.5 grid size-4 place-items-center bg-surface">
                  <Icon className={cn("size-4", config.tone)} />
                </span>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                  <span className={cn("font-semibold", config.tone)}>{config.label}</span>
                  {detail && <span className="text-ink-70">{detail}</span>}
                </div>
                <p className="mt-0.5 text-xs text-ink-45">
                  {event.actor?.full_name || "Unknown"} · <LocalTime value={event.created_at} />
                </p>
                {event.body && (
                  <p className="mt-2 max-w-[62ch] whitespace-pre-line text-sm leading-relaxed text-ink-70">
                    {event.body}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
