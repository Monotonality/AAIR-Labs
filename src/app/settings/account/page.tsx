import type { Metadata } from "next";
import { connection } from "next/server";

import { PageHeader } from "@/components/shared/section-heading";
import {
  ChangeEmailForm,
  ChangePasswordForm,
} from "@/components/settings/update-credentials-form";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const instant = false;

export const metadata: Metadata = {
  title: "Account settings",
};

export default async function AccountSettingsPage() {
  await connection();

  let email = "";

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? "";
  }

  return (
    <>
      <PageHeader
        kicker="Account"
        title="Credentials & profile"
        description="Update your sign-in email or change your password from here."
      />
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div className="rounded-[2px] border border-line bg-surface p-6">
          <h2 className="mb-6 font-serif text-2xl">Change password</h2>
          <ChangePasswordForm />
        </div>
        <div className="rounded-[2px] border border-line bg-surface p-6">
          <h2 className="mb-6 font-serif text-2xl">Change email</h2>
          <ChangeEmailForm currentEmail={email} />
        </div>
      </section>
    </>
  );
}