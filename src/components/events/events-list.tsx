import { EventCard } from "@/components/events/event-card";
import type { EventItem } from "@/lib/types";

export function EventsList({ events }: { events: EventItem[] }) {
  if (events.length === 0) {
    return (
      <div className="border border-dashed border-line bg-surface px-6 py-16 text-center">
        <p className="font-serif text-2xl text-ink">Nothing scheduled yet</p>
        <p className="mt-2 text-sm text-ink-70">
          Check back soon or ask leadership at the next SOC meeting.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
