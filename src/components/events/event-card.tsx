import { CalendarDays, MapPin, Link2 } from "lucide-react";
import Link from "next/link";
import type { EventItem } from "@/lib/types";

export function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="flex flex-col gap-3 rounded-[2px] border border-line bg-surface p-5 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-ink">
      <div className="flex items-start justify-end gap-3">
        <time
          dateTime={event.event_date}
          className="text-[11.5px] font-semibold uppercase tracking-wider text-ink-45"
        >
          {formatEventDate(event.event_date)}
        </time>
      </div>

      <h4 className="font-serif text-xl leading-tight">{event.title}</h4>
      <p className="line-clamp-3 text-[13.5px] leading-relaxed text-ink-70">
        {event.description}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-70">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5 text-ink-45" />
          {formatEventDate(event.event_date)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5 text-ink-45" />
          {event.location}
        </span>
      </div>

      {event.registration_link && (
        <div className="mt-auto border-t border-line pt-3">
          <Link
            href={event.registration_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border-b-[1.5px] border-ink pb-0.5 text-[13px] font-semibold text-ink transition-colors hover:border-green hover:text-green"
          >
            <Link2 className="size-3.5" />
            Register
          </Link>
        </div>
      )}
    </article>
  );
}