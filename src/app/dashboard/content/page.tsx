import type { Metadata } from "next";
import { Upload, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Content · Dashboard",
};

const ASSETS = [
  { name: "AAIR Logo PFP", type: "JPG", path: "/aair-logo.jpg" },
  { name: "AAIR LinkedIn Banner", type: "JPG", path: "public/linkedin-banner.jpg" },
  { name: "Onboarding intro slides", type: "4 slides", path: "onboarding-wizard.tsx" },
];

export default function ContentPage() {
  return (
    <div className="space-y-12">
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
          Content management
        </p>
        <h1 className="font-serif text-4xl tracking-tight">Site content</h1>
      </div>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Brand assets</h2>
        <div className="rounded-[2px] border border-line bg-surface">
          <ul className="divide-y divide-line">
            {ASSETS.map((asset) => (
              <li
                key={asset.name}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-ink-45" />
                  <div>
                    <p className="text-sm font-medium">{asset.name}</p>
                    <p className="text-xs text-ink-45">{asset.type}</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm">
                  <Upload className="size-3.5" />
                  Replace
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Onboarding content</h2>
        <p className="max-w-[62ch] text-sm leading-relaxed text-ink-70">
          Intro slides, application questions, and branding checklist items are
          edited here in a future release. The scaffold ships the default
          content in{" "}
          <code className="rounded bg-paper-deep px-1.5 py-0.5 font-mono text-xs">
            OnboardingWizard
          </code>
          .
        </p>
      </section>
    </div>
  );
}