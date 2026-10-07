import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/aair-logo.jpg";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "xl";
  inverted?: boolean;
  /** Render as a round avatar instead of a rounded square. */
  round?: boolean;
}

const SIZES = {
  sm: "size-6",
  md: "size-9",
  xl: "size-20",
} as const;

export function BrandLogo({ className, size = "sm", inverted, round }: BrandLogoProps) {
  return (
    <span
      className={cn(
        "inline-block overflow-hidden bg-ink text-paper",
        SIZES[size],
        round ? "rounded-full" : "rounded-[3px]",
        className,
      )}
    >
      <Image
        src={inverted ? "/aair-logo-inverted.jpg" : LOGO_SRC}
        alt="AAIR Labs"
        width={160}
        height={160}
        className="size-full object-cover"
      />
    </span>
  );
}