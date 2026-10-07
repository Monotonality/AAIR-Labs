import type { Metadata } from "next";
import { LegalPage, Breadcrumb } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "RSO Disclaimer",
};

export default function RsoDisclaimerPage() {
  return (
    <>
      <Breadcrumb label="RSO Disclaimer" href="/rso-disclaimer" />
      <LegalPage kicker="Compliance" title="Student organization disclaimer" updated="October 2026">
        <p>
          AAIR Labs Portal is published by Applied AI Research Labs at UTD, a
          registered student organization. It is not an official publication of
          UT Dallas and does not represent the views of the university or its
          officers. The University of Texas at Dallas is an Equal
          Opportunity/Affirmative Action University.
        </p>
        <p>
          AAIR Labs operates under the guidelines set by the UT Dallas Office
          of Student Transition &amp; Family Programs for registered student
          organizations. For questions about our status as an RSO, contact the
          organization leadership directly.
        </p>
      </LegalPage>
    </>
  );
}