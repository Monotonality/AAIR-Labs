import Link from "next/link";
import { footerNav } from "@/lib/nav";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink text-ink-45">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <BrandLogo size="sm" round />
              <span className="font-bold text-white">AAIR&nbsp;LABS</span>
            </div>
            <p className="max-w-[30ch] text-sm leading-relaxed">
              Applied AI Research Labs at UT Dallas — research, membership, and
              events in one place.
            </p>
          </div>

          {Object.entries(footerNav).map(([key, items]) => (
            <nav key={key} aria-label={key} className="text-sm">
              <h5 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-45">
                {key === "explore"
                  ? "Explore"
                  : key === "members"
                    ? "Members"
                    : "Legal"}
              </h5>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-ink-45/80 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 space-y-3 border-t border-muted-foreground/20 pt-6 text-xs leading-relaxed md:max-w-[95ch]">
          <p>
            AAIR Labs Portal is published by Applied AI Research Labs at UTD, a
            registered student organization. It is not an official publication
            of UT Dallas and does not represent the views of the university or
            its officers. The University of Texas at Dallas is an Equal
            Opportunity/Affirmative Action University.
          </p>
          <p>
            Students with disabilities needing special assistance to attend
            please call (972-883-6551). Texas Relay Operation: 1-800-RELAYTX.
          </p>
        </div>
      </div>
    </footer>
  );
}