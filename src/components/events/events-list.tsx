"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { CATEGORY_LABELS, EVENT_CATEGORIES } from "@/lib/events";
import { cn } from "@/lib/utils";
import type { EventItem } from "@/lib/types";

const ALL = "all" as const;

export function EventsList({ events }: { events: EventItem[] }) {
  const [category, setCategory] = useState<string>(ALL);

  const filtered = useMemo(
    () =>
      category === ALL ? events : events.filter((e) => e.category === category),
    [events, category],
  );

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Filter events by category"
      >
        <Button
          variant={category === ALL ? "default" : "secondary"}
          size="sm"
          className="rounded-[2px]"
          onClick={() => setCategory(ALL)}
        >
          All
        </Button>
        {EVENT_CATEGORIES.map((c) => (
          <Button
            key={c}
            variant={category === c ? "default" : "secondary"}
            size="sm"
            className={cn("rounded-[2px]", category === c && "border-green bg-green text-white")}
            onClick={() => setCategory(c)}
          >
            {CATEGORY_LABELS[c]}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-line bg-surface px-6 py-16 text-center">
          <p className="font-serif text-2xl text-ink">Nothing scheduled yet</p>
          <p className="mt-2 text-sm text-ink-70">
            Check back soon or ask leadership at the next SOC meeting.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </>
  );
}