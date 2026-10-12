import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { EventsManager } from "@/components/portal/events-manager";
import { PageHeader } from "@/components/shared/section-heading";
import { getAuthenticatedUser, isAdmin } from "@/lib/auth-helpers";
import { getEvents } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Events · Portal",
};

export default async function PortalEventsPage() {
  await connection();
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login?next=/portal/events");
  }
  if (!(await isAdmin(user))) {
    redirect("/portal");
  }

  const events = await getEvents();

  return (
    <>
      <PageHeader
        kicker="Admin"
        title="Manage Events"
        description="Create, edit, and remove events on the AAIR Labs calendar."
      />
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <Link
          href="/portal"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to portal
        </Link>
        <EventsManager events={events} />
      </section>
    </>
  );
}
