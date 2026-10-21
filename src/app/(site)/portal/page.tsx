import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { BookOpen, CalendarDays, ClipboardCheck, ClipboardList, FileCheck2, FileText, FlaskConical, FolderOpen, Library, Megaphone, Settings, User, Users } from "lucide-react";

import { OnboardingCard } from "@/components/portal/onboarding-card";
import { PageHeader } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { getAuthenticatedUser, isAdmin } from "@/lib/auth-helpers";
import { getProfileById, isApprovedMember } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Portal",
};

export default async function PortalPage() {
  await connection();
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login?next=/portal");
  }

  const { profile } = await getProfileById(user.id);
  const admin = await isAdmin(user);
  const approved = await isApprovedMember(user.id);

  return (
    <>
      <PageHeader
        kicker="Member portal"
        title={profile?.full_name ? `Welcome, ${profile.full_name}` : "Welcome"}
        description="Finish onboarding, view your personal page, manage your account, and grab member resources."
      />
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <OnboardingCard
            applicationComplete={
              Boolean(profile?.onboarding_completed) || approved
            }
          />

          <div className="flex flex-col gap-4 border border-line bg-surface p-6">
            <User className="size-5 text-ink" />
            <h2 className="font-serif text-2xl">Personal Page</h2>
            <p className="text-sm leading-relaxed text-ink-70">
              View your public researcher page, with your portfolio links and
              published work.
            </p>
            <div className="mt-auto">
              {profile?.username ? (
                <Button asChild size="sm">
                  <Link href={`/researchers/${profile.username}`}>
                    View personal page
                  </Link>
                </Button>
              ) : (
                <Button size="sm" variant="ghost" disabled>
                  Available after onboarding
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 border border-line bg-surface p-6">
            <Settings className="size-5 text-ink" />
            <h2 className="font-serif text-2xl">Account Settings</h2>
            <p className="text-sm leading-relaxed text-ink-70">
              Update your sign-in email or change your password.
            </p>
            <div className="mt-auto">
              <Button asChild size="sm" variant="secondary">
                <Link href="/settings/account">Manage account</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 border border-line bg-surface p-6">
            <FileText className="size-5 text-ink" />
            <h2 className="font-serif text-2xl">Application</h2>
            <p className="text-sm leading-relaxed text-ink-70">
              {approved
                ? "Your membership is approved. Onboarding does not need to be submitted again."
                : "Submit or update your AAIR Labs membership application."}
            </p>
            <div className="mt-auto">
              {approved ? (
                <Button asChild size="sm" variant="secondary">
                  <Link
                    href={
                      profile?.username
                        ? `/researchers/${profile.username}`
                        : "/portal"
                    }
                  >
                    View your page
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" variant="secondary">
                  <Link href="/profile/application">Membership application</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 border border-line bg-surface p-6">
            <FolderOpen className="size-5 text-ink" />
            <h2 className="font-serif text-2xl">Resources</h2>
            <p className="text-sm leading-relaxed text-ink-70">
              Links to the GroupMe, Instagram, and LinkedIn, plus a LinkedIn
              tutorial and downloadable banner options.
            </p>
            <div className="mt-auto">
              <Button asChild size="sm" variant="secondary">
                <Link href="/portal/resources">View resources</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 border border-line bg-surface p-6">
            <FlaskConical className="size-5 text-ink" />
            <h2 className="font-serif text-2xl">My Proposals</h2>
            <p className="text-sm leading-relaxed text-ink-70">
              Track the proposals you have submitted, their review status, and
              the public link you can share.
            </p>
            <div className="mt-auto">
              <Button asChild size="sm" variant="secondary">
                <Link href="/portal/proposals">View my proposals</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 border border-line bg-surface p-6">
            <Library className="size-5 text-ink" />
            <h2 className="font-serif text-2xl">Working Papers</h2>
            <p className="text-sm leading-relaxed text-ink-70">
              Open the projects you lead or co-author, see the current working
              paper, and track director review.
            </p>
            <div className="mt-auto">
              <Button asChild size="sm" variant="secondary">
                <Link href="/projects">View projects</Link>
              </Button>
            </div>
          </div>
        </div>

        {admin && (
          <div className="mt-12 space-y-6">
            <div className="border-b-2 border-ink pb-3">
              <h2 className="font-serif text-2xl tracking-tight">Admin</h2>
              <p className="mt-1 text-sm text-ink-70">
                Review membership applications, manage members, curate external
                reading, and run the events calendar.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-4 border border-line bg-surface p-6">
                <ClipboardCheck className="size-5 text-ink" />
                <h3 className="font-serif text-2xl">Manage Applications</h3>
                <p className="text-sm leading-relaxed text-ink-70">
                  View incoming membership applications and accept or deny them.
                </p>
                <div className="mt-auto">
                  <Button asChild size="sm">
                    <Link href="/portal/applications">
                      Review applications
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4 border border-line bg-surface p-6">
                <FileCheck2 className="size-5 text-ink" />
                <h3 className="font-serif text-2xl">Review Proposals</h3>
                <p className="text-sm leading-relaxed text-ink-70">
                  Approve or deny submitted proposals, leave feedback, and set
                  which approved proposals are listed publicly.
                </p>
                <div className="mt-auto">
                  <Button asChild size="sm">
                    <Link href="/portal/proposals/review">
                      Review proposals
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4 border border-line bg-surface p-6">
                <ClipboardList className="size-5 text-ink" />
                <h3 className="font-serif text-2xl">Review Projects</h3>
                <p className="text-sm leading-relaxed text-ink-70">
                  Approve or deny working-paper projects, leave feedback for the
                  team, and reopen approved projects for changes.
                </p>
                <div className="mt-auto">
                  <Button asChild size="sm">
                    <Link href="/portal/projects/review">
                      Review projects
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4 border border-line bg-surface p-6">
                <Users className="size-5 text-ink" />
                <h3 className="font-serif text-2xl">Manage Members</h3>
                <p className="text-sm leading-relaxed text-ink-70">
                  Update member titles, grant admin access, and remove accounts.
                </p>
                <div className="mt-auto">
                  <Button asChild size="sm">
                    <Link href="/portal/members">Manage members</Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4 border border-line bg-surface p-6">
                <Megaphone className="size-5 text-ink" />
                <h3 className="font-serif text-2xl">Generate Marketing</h3>
                <p className="text-sm leading-relaxed text-ink-70">
                  Fill in the event details and download the square and story
                  graphics.
                </p>
                <div className="mt-auto">
                  <Button asChild size="sm">
                    <Link href="/portal/marketing">Generate marketing</Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4 border border-line bg-surface p-6">
                <BookOpen className="size-5 text-ink" />
                <h3 className="font-serif text-2xl">External reading</h3>
                <p className="text-sm leading-relaxed text-ink-70">
                  Add, revise, or remove outside sources and the context note
                  shown in the public library.
                </p>
                <div className="mt-auto">
                  <Button asChild size="sm">
                    <Link href="/portal/external-reading">Manage external reading</Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4 border border-line bg-surface p-6">
                <CalendarDays className="size-5 text-ink" />
                <h3 className="font-serif text-2xl">Manage Events</h3>
                <p className="text-sm leading-relaxed text-ink-70">
                  Create, edit, and remove events on the AAIR Labs calendar.
                </p>
                <div className="mt-auto">
                  <Button asChild size="sm">
                    <Link href="/portal/events">Manage events</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
