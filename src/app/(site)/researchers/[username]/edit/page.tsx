import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";

import { ProfileEditor } from "@/components/researchers/profile-editor";
import { PageHeader } from "@/components/shared/section-heading";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { getProfileByUsername } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Edit portfolio",
};

export default async function EditResearcherPage({
  params,
}: PageProps<"/researchers/[username]">) {
  await connection();
  const { username } = await params;
  const [{ profile }, user] = await Promise.all([
    getProfileByUsername(username),
    getAuthenticatedUser(),
  ]);

  if (!profile) {
    notFound();
  }

  if (!user) {
    redirect(`/auth/login?next=/researchers/${username}/edit`);
  }

  if (user.id !== profile.id) {
    redirect(`/researchers/${username}`);
  }

  return (
    <>
      <PageHeader
        kicker="Researcher portfolio"
        title="Edit your page"
        description="Update the photo, bio, and links visitors see on your public portfolio."
      />
      <ProfileEditor profile={profile} />
    </>
  );
}
