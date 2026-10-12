import Link from "next/link";
import { connection } from "next/server";
import { hasSupabaseEnv, createClient } from "@/lib/supabase/server";
import { mainNav } from "@/lib/nav";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { MobileNav } from "@/components/layout/mobile-nav";

export async function SiteHeader() {
  await connection();

  let isAuthed = false;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthed = Boolean(user);
  }

  const authArea = isAuthed ? (
    <>
      <Button asChild variant="ghost" size="sm">
        <Link href="/portal">Portal</Link>
      </Button>
      <SignOutButton />
    </>
  ) : (
    <>
      <Button asChild variant="ghost" size="sm">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/auth/signup">Join</Link>
      </Button>
    </>
  );

  return (
    <header className="relative border-b-2 border-ink bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandLogo size="sm" />
          <span className="text-sm font-bold tracking-tight">
            AAIR&nbsp;LABS
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-5 sm:flex"
        >
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-b border-transparent pb-0.5 text-sm font-medium text-ink-70 transition-colors hover:border-ink hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">{authArea}</div>

        <MobileNav items={mainNav} authArea={authArea} />
      </div>
    </header>
  );
}