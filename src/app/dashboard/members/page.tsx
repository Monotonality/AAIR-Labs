import type { Metadata } from "next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProposalStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Members · Dashboard",
};

const MEMBERS = [
  {
    name: "Priya Nair",
    email: "priya@utdallas.edu",
    major: "Computer Science",
    onboarding: "Complete",
    role: "Director",
  },
  {
    name: "Sam Okafor",
    email: "sam@utdallas.edu",
    major: "Data Science",
    onboarding: "Step 2 of 3",
    role: "Student",
  },
  {
    name: "Elena Ruiz",
    email: "elena@utdallas.edu",
    major: "Software Engineering",
    onboarding: "Complete",
    role: "Student",
  },
];

export default function MembersPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
          Roster management
        </p>
        <h1 className="font-serif text-4xl tracking-tight">Members</h1>
      </div>

      <div className="rounded-[2px] border border-line bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Major</TableHead>
              <TableHead>Onboarding</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MEMBERS.map((member) => (
              <TableRow key={member.email}>
                <TableCell>
                  <span className="font-semibold">{member.name}</span>
                  <span className="block text-xs text-ink-45">
                    {member.email}
                  </span>
                </TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>{member.major}</TableCell>
                <TableCell>
                  {member.onboarding === "Complete" ? (
                    <ProposalStatusBadge status="approved" />
                  ) : (
                    <ProposalStatusBadge status="pending" />
                  )}
                </TableCell>
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
        Rows and actions here are placeholders — they connect to the live
        roster once Supabase env vars are configured.
      </p>
    </div>
  );
}