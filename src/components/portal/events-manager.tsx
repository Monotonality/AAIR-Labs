"use client";

import { useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteEvent, saveEvent } from "@/lib/actions/events";
import type { EventInput, EventItem } from "@/lib/types";

const EMPTY_FORM: EventInput = {
  title: "",
  description: "",
  event_date: "",
  location: "",
  registration_link: "",
};

function toLocalInput(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EventsManager({ events }: { events: EventItem[] }) {
  const [form, setForm] = useState<EventInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const editing = Boolean(form.id);

  function update<K extends keyof EventInput>(key: K, value: EventInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function editEvent(event: EventItem) {
    setError(null);
    setForm({
      id: event.id,
      title: event.title,
      description: event.description ?? "",
      event_date: toLocalInput(event.event_date),
      location: event.location ?? "",
      registration_link: event.registration_link ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPendingId(form.id ?? "new");
    startTransition(async () => {
      const result = await saveEvent(form);
      if (!result.ok) {
        setError(result.error);
      } else {
        setForm(EMPTY_FORM);
      }
      setPendingId(null);
    });
  }

  function onDelete(id: string) {
    if (!window.confirm("Delete this event? This cannot be undone.")) return;
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await deleteEvent(id);
      if (!result.ok) setError(result.error);
      else if (form.id === id) setForm(EMPTY_FORM);
      setPendingId(null);
    });
  }

  const saving = isPending && pendingId === (form.id ?? "new");

  return (
    <div className="space-y-10">
      {error && <Alert variant="destructive">{error}</Alert>}

      <form
        onSubmit={onSubmit}
        className="space-y-5 border border-line bg-surface p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl">
            {editing ? "Edit event" : "Create event"}
          </h2>
          {editing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setForm(EMPTY_FORM)}
            >
              Cancel edit
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-date">Date &amp; time</Label>
            <Input
              id="event-date"
              type="datetime-local"
              value={form.event_date}
              onChange={(e) => update("event_date", e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-location">Location</Label>
            <Input
              id="event-location"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-registration">Registration link (optional)</Label>
            <Input
              id="event-registration"
              inputMode="url"
              placeholder="https://"
              value={form.registration_link}
              onChange={(e) => update("registration_link", e.target.value)}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : editing ? "Save changes" : "Create event"}
        </Button>
      </form>

      <div className="space-y-4">
        <h2 className="font-serif text-2xl">All events</h2>
        {events.length === 0 ? (
          <div className="border border-dashed border-line bg-surface px-6 py-12 text-center">
            <p className="text-sm text-ink-70">
              No events yet. Create the first one above.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line border border-line bg-surface">
            {events.map((event) => {
              const busy = isPending && pendingId === event.id;
              return (
                <li
                  key={event.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-5"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{event.title}</p>
                    <p className="mt-0.5 text-sm text-ink-70">
                      {formatDateTime(event.event_date)}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => editEvent(event)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => onDelete(event.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
