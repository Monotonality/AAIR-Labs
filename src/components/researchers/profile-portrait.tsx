import { cn } from "@/lib/utils";
import { initials } from "@/components/researchers/researcher-card";

export function ProfilePortrait({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  if (src) {
    return (
      // User-uploaded storage URLs are not in the Next image allowlist.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={cn("size-36 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "grid size-36 place-items-center rounded-full bg-ink font-serif text-5xl text-paper",
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
