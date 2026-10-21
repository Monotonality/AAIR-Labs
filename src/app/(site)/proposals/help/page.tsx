import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleUserRound, Scale } from "lucide-react";

import { PageHeader } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { PROPOSAL_CATEGORY_CONFIG } from "@/lib/proposal-categories";

export const instant = false;

export const metadata: Metadata = {
  title: "How Proposals Work",
  description:
    "Authorship, credit, required fields, and the director review process for AAIR Labs proposals.",
};

export default function ProposalHelpPage() {
  const categories = Object.values(PROPOSAL_CATEGORY_CONFIG);

  return (
    <>
      <PageHeader
        kicker="Proposal guidelines"
        title="How Proposals Work"
        description="Every AAIR Labs project starts as a proposal. This page covers what each category requires, how credit works, and what the Director of Research looks for during review."
      >
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild size="sm">
            <Link href="/proposals/apply">
              Start a proposal
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/proposals">Browse current research</Link>
          </Button>
        </div>
      </PageHeader>

      <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <div className="space-y-14">
          <section>
            <h2 className="border-b-2 border-ink pb-2 font-serif text-3xl tracking-tight">
              The basics
            </h2>
            <ul className="mt-5 space-y-4">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ink" />
                <p className="text-sm leading-relaxed text-ink-70">
                  Every project is scoped to{" "}
                  <strong className="text-ink">one semester</strong>, or up to
                  1.5 semesters for unusually large work. Proposals that cannot
                  fit that window should be split into smaller proposals.
                </p>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ink" />
                <p className="text-sm leading-relaxed text-ink-70">
                  One member submits the proposal. That person becomes the{" "}
                  <strong className="text-ink">Lead Researcher</strong> and is
                  responsible for coordinating the work.
                </p>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ink" />
                <p className="text-sm leading-relaxed text-ink-70">
                  You pick one of three categories at the start. The category
                  decides which questions you answer in the form.
                </p>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="border-b-2 border-ink pb-2 font-serif text-3xl tracking-tight">
              Categories and required fields
            </h2>
            <div className="mt-6 space-y-8">
              {categories.map((category) => (
                <div
                  key={category.label}
                  className="border border-line bg-surface p-6"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
                    Category
                  </p>
                  <h3 className="mt-1 font-serif text-2xl">
                    {category.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-70">
                    {category.description}
                  </p>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
                    Required answers
                  </p>
                  <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {category.fields.map((field) => (
                      <li
                        key={field.key}
                        className="flex items-start gap-2 text-sm text-ink"
                      >
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ink" />
                        <span>{field.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="border-b-2 border-ink pb-2 font-serif text-3xl tracking-tight">
              Authorship and credit
            </h2>
            <div className="mt-6 space-y-5">
              <div className="flex gap-3">
                <CircleUserRound className="mt-0.5 size-5 shrink-0 text-ink" />
                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    The proposer leads and is first author
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-70">
                    The person who submits the proposal is automatically the
                    Lead Researcher and the first name on any resulting paper.
                    Credit cannot be reordered later without agreement from the
                    lead and every listed author.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CircleUserRound className="mt-0.5 size-5 shrink-0 text-ink" />
                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    Contributors become co-authors
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-70">
                    Members who make a substantial contribution, such as
                    analysis, writing, engineering, or data work, are added as
                    co-authors. Contributors who prefer another credit form,
                    such as acknowledgements, should say so with the lead before
                    the paper is drafted.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Scale className="mt-0.5 size-5 shrink-0 text-ink" />
                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    Papers stay publicly listed
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-70">
                    Work produced in the lab is listed on the public library
                    with its authors. A paper is never removed or transferred
                    to another owner unless the directors and all listed
                    authors agree to a rights transfer.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="border-b-2 border-ink pb-2 font-serif text-3xl tracking-tight">
              Director review
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-70">
              <p>
                The Director of Research reviews each proposal for{" "}
                <strong className="text-ink">completeness</strong> and{" "}
                <strong className="text-ink">
                  fit with the lab&apos;s research direction
                </strong>
                . The reviewer checks that the question is clear, the method is
                realistic for one semester, the required fields are filled in,
                and the project overlaps with the lab&apos;s existing work in a
                useful way.
              </p>
              <p>
                Approved proposals appear on{" "}
                <Link
                  href="/proposals"
                  className="text-ink underline underline-offset-4 hover:text-ink-70"
                >
                  Current Research
                </Link>{" "}
                and stay listed while they are active. Directors can set a
                proposal private at the end of a semester, for example when the
                work moves into writing or review.
              </p>
              <p>
                If a proposal is denied, the author receives feedback and can
                edit the proposal and resubmit it as often as they want. A
                denied proposal stays private while it is being revised.
              </p>
            </div>
          </section>

          <div className="border border-ink bg-surface p-6">
            <h2 className="font-serif text-2xl">Ready to propose?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-70">
              Pick a category, answer the required questions, and add links to
              any prior work. You can save nothing in between, so have your
              answers ready before you open the form.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button asChild size="sm">
                <Link href="/proposals/apply">
                  Make a proposal
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/proposals">See listed proposals</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
