import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function LegalPage({
  kicker,
  title,
  updated,
  children,
}: {
  kicker: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="border-b-2 border-ink bg-paper">
        <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-12 sm:px-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
            {kicker}
          </p>
          <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-xs text-ink-45">Last updated {updated}</p>
        </div>
      </div>
      <article className="mx-auto w-full max-w-3xl space-y-6 px-4 py-12 text-[15px] leading-relaxed text-ink-70 sm:px-6">
        {children}
      </article>
    </>
  );
}

export function Breadcrumb({ label, href }: { label: string; href: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-3xl px-4 pt-8">
      <ol className="flex items-center gap-1 text-xs text-ink-45">
        <li>
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="size-3" />
        </li>
        <li>
          <Link href={href} className="font-medium text-ink">
            {label}
          </Link>
        </li>
      </ol>
    </nav>
  );
}