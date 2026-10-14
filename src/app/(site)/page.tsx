import Link from "next/link";
import { ArrowRight, BookOpen, ChevronDown, Info, LibraryBig, Search, Users } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = {
  title: "AAIR Labs Library",
  description: "A research library for Applied AI Research Labs at UT Dallas.",
};

const SUBJECTS = [
  {
    title: "Artificial Intelligence",
    description:
      "Machine learning, deep learning, NLP, computer vision, and agent systems.",
    href: "/library?subject=AI",
  },
  {
    title: "Data Science & Analytics",
    description: "Methodology, statistics, data engineering, and evaluation.",
    href: "/library?subject=Data+Science",
  },
  {
    title: "Human–AI Interaction",
    description: "Usability, ethics, safety, and responsible AI research.",
    href: "/library?subject=HCI",
  },
  {
    title: "Security & Privacy",
    description: "Trustworthy AI, adversarial robustness, and privacy-preserving methods.",
    href: "/library?subject=Security",
  },
  {
    title: "Systems & Infrastructure",
    description: "MLOps, scaling, edge, and performance for AI workloads.",
    href: "/library?subject=Systems",
  },
  {
    title: "Interdisciplinary",
    description: "AI applications across domains, policy, and education.",
    href: "/library?subject=Interdisciplinary",
  },
];

const RESOURCES = [
  {
    icon: Info,
    title: "About",
    description: "Our mission, faculty ties, and how AAIR Labs bridges students and research.",
    href: "/about",
  },
  {
    icon: LibraryBig,
    title: "Collected Works",
    description:
      "AAIR Labs papers and reports, plus external reading the lab recommends but did not produce.",
    href: "/library",
  },
  {
    icon: Users,
    title: "Researchers",
    description: "Member profiles, portfolios, and areas of expertise.",
    href: "/researchers",
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero with photo background + search */}
      <section className="relative flex min-h-[520px] items-center justify-center border-b border-line overflow-hidden bg-ink">
        {/* Background image - placeholder, can be replaced with AAIR Assets */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/logo.png')",
            backgroundBlendMode: "overlay",
            backgroundColor: "rgba(0,0,0,0.55)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
          <div className="mb-6 flex items-center justify-center">
            <BrandLogo size="xl" className="rounded-md bg-paper/95 p-3 shadow-lg" />
          </div>

          <h1 className="text-center font-serif text-4xl leading-tight tracking-tight text-white sm:text-6xl drop-shadow-lg">
            AAIR Labs Research Library
          </h1>
          <p className="mt-4 text-center text-lg leading-relaxed text-paper/80 sm:text-xl">
            Search papers, technical reports, and research from Applied AI
            Research Labs at UT Dallas.
          </p>

          {/* Search bar */}
          <form action="/library" className="mt-8">
            <div className="relative mx-auto flex max-w-2xl items-center">
              <Input
                type="search"
                name="q"
                placeholder="Search papers..."
                className="h-14 rounded-full border-white bg-white pl-12 pr-32 text-base text-ink shadow-2xl"
                aria-label="Search the research library"
              />
              <Search className="absolute left-4 size-5 text-ink-50" aria-hidden="true" />
              <Button
                type="submit"
                size="lg"
                className="absolute right-2 rounded-full"
              >
                Search
              </Button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="secondary" size="sm" className="bg-white text-ink hover:bg-white/90">
              <Link href="/library">Browse all papers</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-paper hover:bg-paper/10 hover:text-paper">
              <Link href="/researchers">Explore researchers</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Resources section */}
      <section className="border-b border-line bg-surface py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-10">
            <h2 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
              Resources
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-70">
              Explore our story, our collections, and the members driving our
              research.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {RESOURCES.map((resource) => (
              <Link
                key={resource.title}
                href={resource.href}
                className="group flex flex-col gap-4 border border-line bg-paper p-6 transition-colors hover:border-ink"
              >
                <resource.icon className="size-6 text-ink" />
                <div>
                  <h3 className="font-serif text-2xl text-ink">{resource.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-70">
                    {resource.description}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-ink group-hover:text-green">
                  Learn more <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects with dropdowns */}
      <section className="border-b border-line bg-paper py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-10">
            <h2 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
              Browse by Subject
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-70">
              Discover research across core areas of artificial intelligence and
              its applications.
            </p>
          </div>

          <div className="divide-y divide-line border-t border-line">
            {SUBJECTS.map((subject) => (
              <details key={subject.title} className="group">
                <summary className="flex cursor-pointer items-center justify-between py-5 pr-2 list-none transition-colors hover:bg-surface/40">
                  <h3 className="font-serif text-xl text-ink sm:text-2xl">
                    {subject.title}
                  </h3>
                  <ChevronDown className="size-5 shrink-0 text-ink-50 transition-transform group-open:rotate-180" />
                </summary>
                <div className="pb-6 pr-2 pl-1">
                  <p className="max-w-3xl text-sm leading-relaxed text-ink-70">
                    {subject.description}
                  </p>
                  <div className="mt-4">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={subject.href}>
                        View papers <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* New to the library */}
      <section className="border-b border-line bg-surface py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
                New to the library?
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-70">
                Learn how our peer-review pipeline works, how to submit a
                proposal, or get oriented as a new member.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/portal/onboarding">
                  Get started <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/library">Browse the collection</Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="border border-line bg-paper p-5">
              <BookOpen className="size-5 text-ink" />
              <h3 className="mt-3 font-serif text-xl">How publishing works</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-70">
                Papers move through a structured 5-step approval pipeline before
                public release.
              </p>
            </div>
            <div className="border border-line bg-paper p-5">
              <Users className="size-5 text-ink" />
              <h3 className="mt-3 font-serif text-xl">Join AAIR Labs</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-70">
                Open to UT Dallas students. Create your profile and portfolio
                as you publish.
              </p>
            </div>
            <div className="border border-line bg-paper p-5">
              <LibraryBig className="size-5 text-ink" />
              <h3 className="mt-3 font-serif text-xl">Open access research</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-70">
                The public library holds member papers and external reading.
                Outside sources are labeled and were not written by AAIR Labs.
              </p>
            </div>
          </div>
        </div>
      </section>


    </main>
  );
}
