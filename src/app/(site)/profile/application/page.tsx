import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AlreadyMemberNotice } from "@/components/onboarding/already-member-notice";
import { PageHeader } from "@/components/shared/section-heading";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { getProfileById, isApprovedMember } from "@/lib/data/queries";
import { ProfileApplicationForm } from "@/components/profile/profile-application-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Membership Application",
};

export default async function MembershipApplicationPage() {
  await connection();
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login?next=/profile/application");
  }

  const { profile } = await getProfileById(user.id);
  const approved = await isApprovedMember(user.id);

  return (
    <>
      <PageHeader
        kicker="Membership"
        title={approved ? "Membership approved" : "Membership Application"}
        description={
          approved
            ? "Your membership application has already been approved."
            : "Fill out your details to apply for AAIR Labs membership."
        }
      />
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        {approved ? (
          <AlreadyMemberNotice username={profile?.username ?? null} />
        ) : (
          <ProfileApplicationForm
            profile={profile}
            accountName={
              profile?.full_name ??
              (user.user_metadata?.full_name as string | undefined) ??
              ""
            }
            accountEmail={user.email ?? profile?.email ?? ""}
          />
        )}
      </section>
    </>
  );
}
