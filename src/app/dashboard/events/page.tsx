import type { Metadata } from "next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { getEvents } from "@/lib/data/queries";
import { CATEGORY_LABELS } from "@/lib/events";

export const metadata: Metadata = {
  title: "Events · Dashboard",
};

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
            Calendar admin
          </p>
          <h1 className="font-serif text-4xl tracking-tight">Events</h1>
        </div>
        <Button>New event</Button>
      </div>

      <div className="overflow-x-auto rounded-[2px] border border-line bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="max-w-[260px] font-medium">
                  {event.title}
                </TableCell>
                <TableCell className="text-ink-70">
                  {CATEGORY_LABELS[event.category]}
                </TableCell>
                <TableCell className="text-ink-70">
                  {new Date(event.event_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-ink-70">{event.location}</TableCell>
                <TableCell className="text-right">
                  <Button variant="secondary" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h2 className="font-serif text-2xl">Upcoming preview</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {events.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}