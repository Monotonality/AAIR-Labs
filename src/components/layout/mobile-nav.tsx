"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { NavItem } from "@/lib/nav";

interface MobileNavProps {
  items: NavItem[];
  /** Desktop-only auth actions, re-rendered as a stacked list on mobile. */
  authArea: React.ReactNode;
}

export function MobileNav({ items, authArea }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex size-9 items-center justify-center rounded-[2px] border border-line text-ink transition-colors hover:border-ink"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (!target.closest("form")) setOpen(false);
          }}
          className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-3rem)] overflow-y-auto border-b-2 border-ink bg-background shadow-xl"
        >
          <nav
            aria-label="Primary"
            className="mx-auto flex w-full max-w-6xl flex-col px-4 pt-2 sm:px-6"
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line py-3 font-medium text-ink-70 transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 pb-2 pt-3 sm:px-6">
            {authArea}
          </div>
        </div>
      )}
    </div>
  );
}