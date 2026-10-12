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
  size = "default",
}: {
  kicker?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  size?: "default" | "compact";
}) {
  const compact = size === "compact";

  return (
    <div className={cn("border-b border-line bg-paper", className)}>
      <div
        className={cn(
          "mx-auto w-full max-w-6xl px-4 sm:px-6",
          compact ? "pb-5 pt-6 sm:pt-8" : "pb-10 pt-12 sm:pt-16",
        )}
      >
        {kicker && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
            {kicker}
          </p>
        )}
        <h1
          className={cn(
            "font-serif leading-[1.05] tracking-tight text-ink",
            compact
              ? "max-w-[20ch] text-3xl sm:text-4xl"
              : "max-w-[14ch] text-4xl sm:text-6xl",
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "max-w-[58ch] leading-relaxed text-ink-70",
              compact ? "mt-2 text-sm sm:text-base" : "mt-4 text-base sm:text-lg",
            )}
          >
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}