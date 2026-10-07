import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PaperStatus, ProposalStatus } from "@/lib/types";

type StatusMap = { label: string; className: string };

const PROPOSAL_STATUS: Record<ProposalStatus, StatusMap> = {
  pending: {
    label: "Pending",
    className: "border-ink bg-transparent text-ink",
  },
  approved: {
    label: "Approved",
    className: "border-green bg-green-tint text-green",
  },
  rejected: {
    label: "Rejected",
    className: "border-orange bg-orange-tint text-orange",
  },
  revision_requested: {
    label: "Revision Requested",
    className: "border-orange bg-orange-tint text-orange",
  },
};

const PAPER_STATUS: Record<PaperStatus, StatusMap> = {
  draft: {
    label: "Draft",
    className: "border-line bg-paper text-ink-45",
  },
  under_review: {
    label: "Under Review",
    className: "border-ink bg-transparent text-ink",
  },
  revision_required: {
    label: "Revision",
    className: "border-orange bg-orange-tint text-orange",
  },
  published: {
    label: "Published",
    className: "border-ink bg-ink text-paper",
  },
};

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const s = PROPOSAL_STATUS[status];
  return (
    <Badge variant="outline" className={cn("rounded-[2px] uppercase", s.className)}>
      {s.label}
    </Badge>
  );
}

export function PaperStatusBadge({ status }: { status: PaperStatus }) {
  const s = PAPER_STATUS[status];
  return (
    <Badge variant="outline" className={cn("rounded-[2px] uppercase", s.className)}>
      {s.label}
    </Badge>
  );
}