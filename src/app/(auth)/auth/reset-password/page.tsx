import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const instant = false;

export const metadata: Metadata = {
  title: "Reset password",
};

export default async function ResetPasswordPage() {
  let recoveryMode = false;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // A recovery link grants a session; presence means "set a new password".
    recoveryMode = Boolean(session);
  }

  return (
    <AuthCard
      kicker="Account recovery"
      title={recoveryMode ? "Set a new password" : "Reset your password"}
      footer={
        <>
          Remembered it?{" "}
          <a href="/auth/login" className="font-semibold underline-offset-4 hover:underline">
            Back to sign in
          </a>
        </>
      }
    >
      <ResetPasswordForm mode={recoveryMode ? "update" : "request"} />
    </AuthCard>
  );
}