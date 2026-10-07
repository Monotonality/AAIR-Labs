"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  CalendarDays,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/members", label: "Members", icon: Users, exact: true },
  { href: "/dashboard/research", label: "Research Pipeline", icon: FlaskConical, exact: true },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays, exact: true },
  { href: "/dashboard/content", label: "Content", icon: Palette, exact: true },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full space-y-1 lg:w-56" aria-label="Dashboard">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-[2px] px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-ink text-paper"
                : "text-ink-70 hover:bg-paper-deep hover:text-ink",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}