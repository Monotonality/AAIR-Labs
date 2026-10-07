import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function AuthCard({
  kicker,
  title,
  children,
  footer,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="mb-8 flex items-center justify-center gap-2.5"
      >
        <BrandLogo size="sm" />
        <span className="text-sm font-bold tracking-tight">
          AAIR&nbsp;LABS
          <span className="ml-1.5 font-medium text-ink-45">/ Portal</span>
        </span>
      </Link>

      <div className="border-2 border-ink bg-surface p-8 sm:p-10">
        {kicker && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
            {kicker}
          </p>
        )}
        <h1 className="mb-1 font-serif text-3xl leading-tight">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>

      {footer && (
        <p className="mt-6 text-center text-sm text-ink-70">{footer}</p>
      )}
    </div>
  );
}