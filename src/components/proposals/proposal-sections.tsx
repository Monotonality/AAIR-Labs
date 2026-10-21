import { ArrowUpRight } from "lucide-react";

import { PROPOSAL_CATEGORY_CONFIG } from "@/lib/proposal-categories";
import type { Proposal, ProposalReference } from "@/lib/types";

export function ProposalSections({ proposal }: { proposal: Proposal }) {
  const config = PROPOSAL_CATEGORY_CONFIG[proposal.category];
  const details = proposal.details ?? { priorWorks: [], deliverables: "" };
  const rawWorks = details.priorWorks;
  const priorWorks: ProposalReference[] = Array.isArray(rawWorks)
    ? rawWorks
    : [];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="border-b-2 border-ink pb-2 font-serif text-2xl tracking-tight">
          Proposal details
        </h2>
        <dl className="mt-6 space-y-6">
          {config.fields.map((field) => {
            const raw = details[field.key];
            const text = typeof raw === "string" ? raw.trim() : "";
            return (
              <div key={field.key}>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-45">
                  {field.label}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap text-ink">
                  {text || (
                    <span className="text-ink-45">Not provided.</span>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section>
        <h2 className="border-b-2 border-ink pb-2 font-serif text-2xl tracking-tight">
          Prior work
        </h2>
        {priorWorks.length === 0 ? (
          <p className="mt-4 text-sm text-ink-70">
            No prior work was listed for this proposal.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {priorWorks.map((work, index) => (
              <li key={`${work.url}-${index}`} className="text-sm">
                <a
                  href={work.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-ink underline underline-offset-4 hover:text-ink-70"
                >
                  {work.title}
                  <ArrowUpRight className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
