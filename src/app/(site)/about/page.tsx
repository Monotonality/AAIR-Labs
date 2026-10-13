import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader, SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Applied AI Research Labs at The University of Texas at Dallas, an academic-interest student organization bridging students and faculty research.",
};

const PILLARS = [
  {
    title: "Cross-Disciplinary Collaboration",
    description:
      "The lab brings together students from diverse backgrounds across JSOM, Computer Science, and Engineering to tackle complex intelligent systems together.",
  },
  {
    title: "Real Research Exposure",
    description:
      "Members don't just talk about AI trends; they analyze academic literature, conduct peer code reviews, and build novel applied frameworks.",
  },
  {
    title: "Direct Faculty Connection",
    description:
      "It serves as a responsive talent pool for UTD professors who require qualified student researchers, survey distribution cohorts, or project deployment support.",
  },
];

const INLINE_LINK =
  "border-b-[1.5px] border-ink font-medium text-ink hover:border-green hover:text-green";

const ACTIVITIES: {
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}[] = [
  {
    title: "Project Incubation & Presentations",
    description:
      "Share ongoing technical projects, receive constructive peer feedback, and polish systems ready for academic symposiums or competitions.",
  },
  {
    title: "Deep-Dive Literature Analysis",
    description:
      "Read and break down state-of-the-art AI papers to understand the mechanics behind modern technological breakthroughs.",
    href: "/library",
    linkLabel: "Browse the library",
  },
  {
    title: "Career Pathways",
    description:
      "Gain hands-on exposure to both academic research tracks and high-value industry careers.",
    href: "/events",
    linkLabel: "See upcoming events",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        kicker="About"
        title="Applied AI Research Labs at UT Dallas"
        description="If you are a student passionate about artificial intelligence, data science, or building smart systems, and you've ever wondered how to move beyond basic coding tutorials into real, impactful research, AAIR Labs is built for you."
      />

      <section className="mx-auto w-full max-w-6xl space-y-16 px-4 py-12 sm:px-6">
        <div>
          <SectionHeading
            index="01"
            kicker="The Organization"
            title="What is AAIR Labs?"
          />
          <div className="max-w-[68ch] space-y-4 text-base leading-relaxed text-ink-70">
            <p>
              AAIR Labs is an academic-interest student organization at{" "}
              <Link
                href="https://www.utdallas.edu/"
                target="_blank"
                rel="noopener noreferrer"
                className={INLINE_LINK}
              >
                The University of Texas at Dallas
              </Link>{" "}
              (UTD). Founded by{" "}
              <Link
                href="https://www.gardenofadam.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={INLINE_LINK}
              >
                Adam Torres
              </Link>{" "}
              and advised by JSOM faculty member Dr. Judd Bradbury, the
              organization serves as an active bridge uniting ambitious students
              with cutting-edge faculty research.
            </p>
            <p>
              While UTD is full of brilliant minds and advanced research
              initiatives, students often lack a structured space to test and
              refine applied AI ideas. At the same time, professors often need
              an organized pipeline of students to assist with research
              execution, data gathering, and technical projects. AAIR Labs
              bridges that gap.
            </p>
          </div>
        </div>

        <div>
          <SectionHeading
            index="02"
            kicker="Differentiators"
            title="Why is AAIR Labs unique?"
            description="Unlike standard tech clubs that focus exclusively on beginner software workshops or casual networking, AAIR Labs functions as an applied research incubator."
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PILLARS.map((pillar) => (
              <div key={pillar.title} className="border border-line bg-surface p-6">
                <h3 className="font-serif text-xl text-ink">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-70">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeading
            index="03"
            kicker="In Practice"
            title="What do members do?"
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ACTIVITIES.map((activity) => (
              <div key={activity.title} className="border border-line bg-paper p-6">
                <h3 className="font-serif text-xl text-ink">{activity.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-70">
                  {activity.description}
                </p>
                {activity.href && (
                  <Link
                    href={activity.href}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-green"
                  >
                    {activity.linkLabel} <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeading index="04" kicker="Membership" title="Who can join?" />
          <p className="max-w-[68ch] text-base leading-relaxed text-ink-70">
            Membership is open to UTD students across all majors who share a
            drive for academic rigor, open collaboration, and hands-on technical
            creation. Whether you want to collaborate on published faculty
            research, build your own AI framework, or find a community of
            like-minded builders, AAIR Labs provides the runway to launch your
            ideas.
          </p>
        </div>

        <div className="border border-line bg-ink p-8 text-paper sm:p-10">
          <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">
            Want to know more?
          </h2>
          <p className="mt-3 max-w-[58ch] text-base leading-relaxed text-paper/80">
            Learn how to get involved, meet the members, or see what current
            projects the lab is working on.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-paper text-ink hover:bg-paper/90"
            >
              <Link href="/auth/signup">
                Join AAIR Labs <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-paper/40 bg-transparent text-paper hover:bg-paper/10 hover:text-paper"
            >
              <Link href="/researchers">Meet the researchers</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
