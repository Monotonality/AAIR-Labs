import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Users } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { PipelineStepper } from "@/components/shared/pipeline-stepper";
import { PaperCard } from "@/components/library/paper-card";
import { EventCard } from "@/components/events/event-card";
import { ResearcherCard } from "@/components/researchers/researcher-card";
import {
  getEvents,
  getPublishedPapers,
  getResearchers,
} from "@/lib/data/queries";

export const instant = false;

function Hero() {
  return (
    <section className="relative border-b border-line bg-paper">
      <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16">
        <div className="mb-6">
          <BrandLogo size="xl" className="rounded-md" />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
            AAIR Labs at UT Dallas
          </span>
          <span className="text-line">—</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green">
            Registered RSO · Spring 2026
          </span>
        </div>

        <h1 className="max-w-[16ch] font-serif text-5xl leading-[1.02] tracking-tight text-ink sm:text-7xl">
          Student research, <em className="italic">published</em> properly.
        </h1>

        <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-ink-70">
          The central hub for Applied AI Research Labs — submit a paper proposal,
          move it through peer review, and watch it land in the public library
          beside your member portfolio.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/onboarding">
              Join the lab <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/library">Browse the library</Link>
          </Button>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-0 border-t-2 border-ink sm:grid-cols-4">
          {[
            { k: "Pipeline", v: "5-step paper approval" },
            { k: "Members", v: "Private researcher portfolios" },
            { k: "Events", v: "Workshops, SOC, headshots" },
            { k: "Compliance", v: "UTD RSO standards" },
          ].map((m) => (
            <div
              key={m.k}
              className="border-r border-line py-4 pr-5 last:border-r-0"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-45">
                {m.k}
              </p>
              <p className="mt-1 text-sm font-medium text-ink">{m.v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PipelineSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading
          kicker="Research engine"
          title="From proposal to publication"
          description="Every paper moves through the same five gates, from director approval to final checks and public release."
        />
        <PipelineStepper currentStep={1} />
        <div className="mt-6 flex justify-end">
          <Button asChild variant="secondary">
            <Link href="/onboarding">
              Submit a proposal <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

type HomePageProps = {
  papers: Awaited<ReturnType<typeof getPublishedPapers>>;
  events: Awaited<ReturnType<typeof getEvents>>;
  researchers: Awaited<ReturnType<typeof getResearchers>>;
};

function LibraryPreview({ papers }: { papers: HomePageProps["papers"] }) {
  return (
    <section className="border-y border-line bg-surface/60 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading
          index="01"
          kicker="Public library"
          title="Recently published"
          description="Whitepapers and technical frameworks written and reviewed by AAIR Labs members."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {papers.slice(0, 3).map((paper) => (
            <PaperCard key={paper.id} project={paper} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EventsPreview({ events }: { events: HomePageProps["events"] }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading
          index="02"
          kicker="Events"
          title="On the calendar"
          description="Workshops, guest speakers, SOC meetings, and headshot sessions."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <Button asChild variant="ghost">
            <Link href="/events">
              Full calendar <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ResearchersPreview({
  researchers,
}: {
  researchers: HomePageProps["researchers"];
}) {
  return (
    <section className="border-t border-line bg-paper-deep/50 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading
          index="03"
          kicker="Members"
          title="Meet the researchers"
          description="Onboarded members with public portfolios spanning NLP, computer vision, and reinforcement learning."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {researchers.slice(0, 3).map((profile) => (
            <ResearcherCard key={profile.id} profile={profile} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  const items = [
    {
      icon: BookOpen,
      title: "Publish with us",
      desc: "Proposals, status papers, and peer review — all in one pipeline.",
      href: "/onboarding",
      label: "Start onboarding",
    },
    {
      icon: CalendarDays,
      title: "Come to an event",
      desc: "Workshops and meetings are open to all UT Dallas students.",
      href: "/events",
      label: "See the calendar",
    },
    {
      icon: Users,
      title: "Browse the roster",
      desc: "Every member gets a public portfolio with their research feed.",
      href: "/researchers",
      label: "Meet the members",
    },
  ];

  return (
    <section className="border-t border-line py-16 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-3 border border-line bg-surface p-6"
          >
            <item.icon className="size-5 text-ink" />
            <h3 className="font-serif text-2xl">{item.title}</h3>
            <p className="text-sm leading-relaxed text-ink-70">{item.desc}</p>
            <Link
              href={item.href}
              className="mt-auto inline-flex items-center gap-1.5 border-b-[1.5px] border-ink pb-0.5 text-sm font-semibold text-ink transition-colors hover:border-green hover:text-green"
            >
              {item.label} <ArrowRight className="size-4" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const [papers, events, researchers] = await Promise.all([
    getPublishedPapers(),
    getEvents(),
    getResearchers(),
  ]);

  return (
    <>
      <Hero />
      <PipelineSection />
      <LibraryPreview papers={papers} />
      <EventsPreview events={events} />
      <ResearchersPreview researchers={researchers} />
      <CtaBand />
    </>
  );
}