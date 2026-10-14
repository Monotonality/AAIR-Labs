import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { PageHeader } from "@/components/shared/section-heading";
import { PaperCard } from "@/components/library/paper-card";
import { Button } from "@/components/ui/button";
import { ProfileLinkList } from "@/components/researchers/profile-link-list";
import { ProfilePortrait } from "@/components/researchers/profile-portrait";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { getProfileByUsername } from "@/lib/data/queries";
import { displayLinks, profileSubtitle } from "@/lib/profile";

export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/researchers/[username]">): Promise<Metadata> {
  await connection();
  const { username } = await params;
  const { profile } = await getProfileByUsername(username);
  return { title: profile?.full_name ?? "Researcher" };
}

export default async function ResearcherPage({
  params,
}: PageProps<"/researchers/[username]">) {
  await connection();
  const { username } = await params;
  const [{ profile, papers }, user] = await Promise.all([
    getProfileByUsername(username),
    getAuthenticatedUser(),
  ]);

  if (!profile) {
    notFound();
  }

  const isOwner = user?.id === profile.id;
  const links = displayLinks(profile);
  const published = papers.filter((p) => p.draft?.status === "published");
  const active = papers.filter((p) => p.draft?.status !== "published");
  const subtitle = profileSubtitle(profile);

  return (
    <>
      <PageHeader
        kicker="Researcher portfolio"
        title={profile.full_name}
        description={subtitle || undefined}
      >
        {isOwner && (
          <div className="mt-6">
            <Button asChild>
              <Link href={`/researchers/${profile.username}/edit`}>
                <Pencil />
                Edit page
              </Link>
            </Button>
          </div>
        )}
      </PageHeader>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[320px_1fr]">
        <aside>
          <div className="space-y-5 rounded-[2px] border border-line bg-surface p-6">
            <ProfilePortrait name={profile.full_name} src={profile.avatar_url} />
            <div>
              <p className="font-serif text-2xl leading-tight">{profile.full_name}</p>
              {profile.title && (
                <p className="mt-0.5 text-sm font-medium text-ink-70">{profile.title}</p>
              )}
              {profile.major && (
                <p className="mt-0.5 text-[11.5px] font-semibold uppercase tracking-wider text-ink-45">
                  {profile.major}
                </p>
              )}
            </div>

            {links.length > 0 ? (
              <ProfileLinkList links={links} />
            ) : (
              isOwner && (
                <p className="text-sm leading-relaxed text-ink-70">
                  Add LinkedIn, GitHub, a personal site, or any other link from{" "}
                  <Link
                    href={`/researchers/${profile.username}/edit`}
                    className="border-b border-ink font-semibold text-ink hover:border-green hover:text-green"
                  >
                    Edit page
                  </Link>
                  .
                </p>
              )
            )}

            {profile.fields_of_interest?.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-45">
                  Fields of interest
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.fields_of_interest.map((field) => (
                    <span
                      key={field}
                      className="rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] font-semibold text-ink-70"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="space-y-12">
          <div>
            <h2 className="mb-3 font-serif text-2xl">Bio</h2>
            {profile.bio ? (
              <p className="max-w-[62ch] whitespace-pre-wrap text-base leading-relaxed text-ink-70">
                {profile.bio}
              </p>
            ) : (
              <p className="max-w-[62ch] leading-relaxed text-ink-45">
                {isOwner
                  ? "You have not written a bio yet. A few sentences on what you work on will show up here."
                  : "This member has not written a bio yet."}
              </p>
            )}
          </div>

          {published.length > 0 && (
            <div>
              <h2 className="mb-6 font-serif text-2xl">Published research</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {published.map((paper) => (
                  <PaperCard key={paper.id} project={paper} />
                ))}
              </div>
            </div>
          )}

          {active.length > 0 && (
            <div>
              <h2 className="mb-3 font-serif text-2xl">In progress</h2>
              <ul className="space-y-3">
                {active.map((paper) => (
                  <li
                    key={paper.id}
                    className="flex items-center justify-between gap-4 rounded-[2px] border border-line bg-surface px-5 py-4"
                  >
                    <div>
                      <p className="font-medium">{paper.title}</p>
                      <p className="text-xs text-ink-45">{paper.target_domain}</p>
                    </div>
                    {isOwner && (
                      <Link
                        href="/dashboard/research"
                        className="inline-flex items-center gap-1.5 border-b-[1.5px] border-ink pb-0.5 text-[13px] font-semibold text-ink transition-colors hover:border-green hover:text-green"
                      >
                        <Pencil className="size-3.5" />
                        Track
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {published.length === 0 && active.length === 0 && (
            <p className="text-sm text-ink-45">No published research yet.</p>
          )}

          <div className="border-t border-line pt-6">
            <Button asChild variant="ghost">
              <Link href="/researchers">
                <ArrowLeft />
                All researchers
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
