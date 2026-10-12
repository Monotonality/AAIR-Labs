import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return (
    <AuthCard
      kicker="Join AAIR Labs"
      title="Create account"
      footer={
        <>
          Already have an account?{" "}
          <a href="/auth/login" className="font-semibold underline-offset-4 hover:underline">
            Sign in
          </a>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}