import type { Metadata } from "next";
import { LegalPage, Breadcrumb } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Accessibility",
};

export default function AccessibilityPage() {
  return (
    <>
      <Breadcrumb label="Accessibility" href="/accessibility" />
      <LegalPage kicker="Accessibility" title="Accessibility & ADA" updated="October 2026">
        <p>
          AAIR Labs is committed to making our portal and events accessible to
          all students, including those with disabilities. Pages are built
          against the WCAG 2.1 AA standard: meaningful color contrast,
          keyboard navigation, screen-reader markup, and responsive layouts
          across mobile and desktop.
        </p>
        <p>
          Students with disabilities needing special assistance to attend
          please call (972-883-6551). Texas Relay Operation: 1-800-RELAYTX.
        </p>
        <p>
          If you encounter a barrier on this site, use the institution’s
          accessibility reporting process or contact AAIR Labs leadership so
          we can address it.
        </p>
      </LegalPage>
    </>
  );
}