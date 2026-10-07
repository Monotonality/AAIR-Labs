import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  index?: string;
  kicker?: string;
  title: string;
  description?: string;
}

export function SectionHeading({
  index,
  kicker,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mb-10 border-b-2 border-ink pb-4">
      <div className="flex items-end justify-between gap-6">
        <div>
          {kicker && (
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
              {kicker}
            </p>
          )}
          <h2 className="font-serif text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
            {title}
          </h2>
        </div>
        {index && (
          <span className="font-serif text-3xl leading-none text-line sm:text-4xl">
            {index}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-ink-70">
          {description}
        </p>
      )}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  description,
  children,
  className,
}: {
  kicker?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-line bg-paper", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
        {kicker && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
            {kicker}
          </p>
        )}
        <h1 className="max-w-[14ch] font-serif text-4xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-ink-70 sm:text-lg">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}