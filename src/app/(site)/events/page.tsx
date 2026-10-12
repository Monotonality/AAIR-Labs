import type { Metadata } from "next";
import { connection } from "next/server";

import { EventsCalendar } from "@/components/events/events-calendar";
import { PageHeader } from "@/components/shared/section-heading";
import { getEvents } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Events",
};

export default async function EventsPage() {
  await connection();
  const events = await getEvents();
  const now = new Date();

  return (
    <>
      <PageHeader
        size="compact"
        kicker="Events"
        title="Calendar"
        description="Workshops, speakers, and SOC meetings. Select a date to open the details."
      />
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <EventsCalendar
          events={events}
          initialYear={now.getFullYear()}
          initialMonth={now.getMonth()}
        />
      </section>
    </>
  );
}