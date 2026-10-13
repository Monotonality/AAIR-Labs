"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

import { formatEventDate } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EventItem } from "@/lib/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
  });
}

function eventTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function EventsCalendar({
  events,
  initialYear,
  initialMonth,
}: {
  events: EventItem[];
  initialYear: number;
  initialMonth: number;
}) {
  const [cursor, setCursor] = useState({
    year: initialYear,
    month: initialMonth,
  });
  const [placed, setPlaced] = useState(false);
  const [todayKey, setTodayKey] = useState<string | null>(null);
  const [openDay, setOpenDay] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    setTodayKey(dayKey(now));
    setPlaced(true);
  }, []);

  const days = useMemo(
    () => monthGrid(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    if (!placed) return map;
    for (const event of events) {
      const key = dayKey(new Date(event.event_date));
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.event_date.localeCompare(b.event_date));
    }
    return map;
  }, [events, placed]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(cursor.year, cursor.month, 1));

  const selectedEvents = openDay ? (byDay.get(openDay) ?? []) : [];
  const selectedLabel = openDay
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(
        new Date(
          Number(openDay.split("-")[0]),
          Number(openDay.split("-")[1]),
          Number(openDay.split("-")[2]),
        ),
      )
    : "";

  function shiftMonth(delta: number) {
    setCursor((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  function goToToday() {
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl tracking-tight text-ink sm:text-3xl">
          {monthLabel}
        </h2>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden border border-line bg-surface">
        <div className="grid grid-cols-7 border-b border-line bg-paper">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-1 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-45 sm:px-2"
            >
              <span className="sm:hidden">{day.slice(0, 1)}</span>
              <span className="hidden sm:inline">{day}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = dayKey(day);
            const inMonth = day.getMonth() === cursor.month;
            const dayEvents = byDay.get(key) ?? [];
            const isToday = todayKey === key;
            const visible = dayEvents.slice(0, 2);
            const extra = dayEvents.length - visible.length;

            return (
              <div
                key={key}
                className="min-h-16 border-r border-b border-line p-1 last:border-r-0 sm:min-h-28 sm:p-1.5 [&:nth-child(7n)]:border-r-0"
              >
                <button
                  type="button"
                  disabled={dayEvents.length === 0}
                  onClick={() => setOpenDay(key)}
                  className={`mb-1 grid size-6 place-items-center text-xs font-semibold sm:size-7 ${
                    isToday
                      ? "bg-ink text-paper"
                      : inMonth
                        ? "text-ink"
                        : "text-ink-45"
                  } ${dayEvents.length > 0 ? "hover:bg-ink hover:text-paper" : ""}`}
                  aria-label={
                    dayEvents.length > 0
                      ? `${day.getDate()}, ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}`
                      : undefined
                  }
                >
                  {day.getDate()}
                </button>

                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 sm:hidden" aria-hidden>
                    {dayEvents.slice(0, 3).map((event) => (
                      <span key={event.id} className="size-1.5 bg-ink" />
                    ))}
                  </div>
                )}

                <ul className="hidden space-y-1 sm:block">
                  {visible.map((event) => (
                    <li key={event.id}>
                      <button
                        type="button"
                        onClick={() => setOpenDay(key)}
                        className="block w-full truncate bg-paper px-1.5 py-0.5 text-left text-[11px] font-medium text-ink hover:bg-ink hover:text-paper"
                      >
                        {eventTime(event.event_date)} {event.title}
                      </button>
                    </li>
                  ))}
                  {extra > 0 && (
                    <li>
                      <button
                        type="button"
                        onClick={() => setOpenDay(key)}
                        className="px-1.5 text-[11px] font-semibold text-ink-70 hover:text-ink"
                      >
                        +{extra} more
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-ink-45">
        {placed && events.length === 0
          ? "Nothing is scheduled yet."
          : "Select a date to open its events."}
      </p>

      <Dialog open={openDay !== null} onOpenChange={(open) => !open && setOpenDay(null)}>
        <DialogContent className="max-h-[min(80vh,40rem)] overflow-y-auto bg-paper sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{selectedLabel}</DialogTitle>
            <DialogDescription>
              {selectedEvents.length === 1
                ? "1 event"
                : `${selectedEvents.length} events`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {selectedEvents.map((event) => (
              <article key={event.id} className="space-y-2 border-t border-line pt-4">
                <h3 className="font-serif text-xl leading-tight">{event.title}</h3>
                <p className="text-sm text-ink-70">{formatEventDate(event.event_date)}</p>
                {event.location && (
                  <p className="inline-flex items-center gap-1.5 text-sm text-ink-70">
                    <MapPin className="size-3.5 text-ink-45" />
                    {event.location}
                  </p>
                )}
                {event.description && (
                  <p className="text-sm leading-relaxed text-ink-70">{event.description}</p>
                )}
                {event.registration_link && (
                  <a
                    href={event.registration_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex border-b-[1.5px] border-ink pb-0.5 text-[13px] font-semibold text-ink hover:border-green hover:text-green"
                  >
                    Register
                  </a>
                )}
              </article>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
