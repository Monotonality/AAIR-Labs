import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/section-heading";
import { EventsList } from "@/components/events/events-list";
import { getEvents } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Events",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <PageHeader
        kicker="Events & Announcements"
        title="Workshops, speakers & SOC meetings"
        description="Public calendar for AAIR Labs programming. Registration links are listed when a session requires a seat."
      />
      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-12 sm:px-6">
        <EventsList events={events} />
      </section>
    </>
  );
}