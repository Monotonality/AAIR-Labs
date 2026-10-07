import Link from "next/link";
import { connection } from "next/server";
import { hasSupabaseEnv, createClient } from "@/lib/supabase/server";
import { BrandLogo } from "@/components/brand-logo";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SignOutButton } from "@/components/layout/sign-out-button";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div className="flex min-h-screen flex-col">
      <header className="border-b-2 border-ink bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo size="sm" />
            <span className="text-sm font-bold tracking-tight">
              AAIR&nbsp;LABS
              <span className="ml-1.5 font-medium text-ink-45">/ Dashboard</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {email && (
              <span className="hidden text-sm text-ink-45 sm:inline">
                {email}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row">
        <DashboardNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}