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
import {
  ProposalStatusBadge,
  PaperStatusBadge,
} from "@/components/shared/status-badge";
import type { PaperStatus, ProposalStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Research Pipeline · Dashboard",
};

const PIPELINE = [
  {
    title: "Efficient Fine-Tuning on Consumer GPUs",
    author: "Marsha Alvarez",
    proposal: "approved" as ProposalStatus,
    paper: "published" as PaperStatus,
    reviewer: "Jordan Lee",
  },
  {
    title: "Retrieval-Augmented Tutoring Agents",
    author: "Jordan Lee",
    proposal: "approved" as ProposalStatus,
    paper: "under_review" as PaperStatus,
    reviewer: "Priya Nair",
  },
  {
    title: "Diffusion Models for Surgical Planning",
    author: "Sam Okafor",
    proposal: "pending" as ProposalStatus,
    paper: "draft" as PaperStatus,
    reviewer: "—",
  },
  {
    title: "Interpretability for Vision Transformers",
    author: "Elena Ruiz",
    proposal: "revision_requested" as ProposalStatus,
    paper: "draft" as PaperStatus,
    reviewer: "—",
  },
];

export default function ResearchPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
            Papers & proposals
          </p>
          <h1 className="font-serif text-4xl tracking-tight">
            Research pipeline
          </h1>
        </div>
        <Button>New proposal</Button>
      </div>

      <div className="overflow-x-auto rounded-[2px] border border-line bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Proposal</TableHead>
              <TableHead>Paper</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PIPELINE.map((row) => (
              <TableRow key={row.title}>
                <TableCell className="max-w-[260px] font-medium">
                  {row.title}
                </TableCell>
                <TableCell className="text-ink-70">{row.author}</TableCell>
                <TableCell>
                  <ProposalStatusBadge status={row.proposal} />
                </TableCell>
                <TableCell>
                  <PaperStatusBadge status={row.paper} />
                </TableCell>
                <TableCell className="text-ink-70">{row.reviewer}</TableCell>
                <TableCell className="text-right">
                  <Button variant="secondary" size="sm">
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-ink-45">
        Pipeline rows are placeholders for the scaffold — they read from
        <code className="font-mono"> projects</code> and{" "}
        <code className="font-mono">paper_drafts</code> once configured.
      </p>
    </div>
  );
}