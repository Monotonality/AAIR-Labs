import type { Metadata } from "next";
import { LegalPage, Breadcrumb } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <>
      <Breadcrumb label="Privacy" href="/privacy" />
      <LegalPage kicker="Privacy" title="Privacy policy" updated="October 2026">
        <p>
          AAIR Labs collects the minimum necessary to operate the portal:
          your UTD email, name, major, expected graduation, research interests,
          and portfolio content you choose to publish.
        </p>
        <p>
          Your profile row is created from your sign-up details, and your
          public portfolio only shows what you set as public. Published papers
          are intentionally public — they become part of the AAIR Labs Library.
        </p>
        <p>
          We do not sell member data. Account records are stored in Supabase
          and subject to UT Dallas student privacy expectations. Contact
          leadership to request correction or deletion of your records.
        </p>
      </LegalPage>
    </>
  );
}