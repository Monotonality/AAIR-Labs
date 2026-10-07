import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthCard
      kicker="Member access"
      title="Sign in"
      footer={
        <>
          New to AAIR Labs?{" "}
          <a href="/auth/signup" className="font-semibold underline-offset-4 hover:underline">
            Create an account
          </a>
        </>
      }
    >
      <Suspense
        fallback={
          <div className="grid h-64 animate-pulse place-items-center rounded-[2px] border border-line bg-surface">
            <span className="text-sm text-ink-45">Loading sign in…</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
      <p className="mt-5 text-center text-sm">
        <a
          href="/auth/reset-password"
          className="font-medium text-ink underline-offset-4 hover:underline"
        >
          Forgot your password?
        </a>
      </p>
    </AuthCard>
  );
}