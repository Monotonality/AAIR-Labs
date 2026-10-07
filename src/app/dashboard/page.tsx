import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PipelineStepper } from "@/components/shared/pipeline-stepper";
import { SectionHeading } from "@/components/shared/section-heading";

export const metadata: Metadata = {
  title: "Dashboard",
};

const STATS = [
  { label: "Pending proposals", value: "3", tone: "text-orange" },
  { label: "Under peer review", value: "5", tone: "text-ink" },
  { label: "Published papers", value: "12", tone: "text-green" },
  { label: "Onboarding in progress", value: "8", tone: "text-ink" },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-12">
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
          Director overview
        </p>
        <h1 className="font-serif text-4xl tracking-tight">Research pipeline</h1>
      </div>

      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[2px] border border-line bg-surface p-5"
          >
            <p className={`font-serif text-5xl ${stat.tone}`}>{stat.value}</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-45">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <section>
        <SectionHeading
          title="Live pipeline"
          description="The five approval gates and what sits at each stage today."
        />
        <PipelineStepper currentStep={1} />
      </section>

      <section className="space-y-4">
        <SectionHeading
          title="Quick actions"
          description="The most common administrative operations live behind these links."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: "Review proposals",
              desc: "Approve, reject, or request revisions.",
              href: "/dashboard/research",
            },
            {
              title: "Approve members",
              desc: "Confirm onboarding applications and roles.",
              href: "/dashboard/members",
            },
            {
              title: "Manage events",
              desc: "Create and edit public calendar entries.",
              href: "/dashboard/events",
            },
          ].map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-[2px] border border-line bg-surface p-6 transition-colors hover:border-ink"
            >
              <h3 className="font-serif text-xl">{action.title}</h3>
              <p className="mt-1 text-sm text-ink-70">{action.desc}</p>
              <ArrowRight className="mt-4 size-4 text-ink transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}