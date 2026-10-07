import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/shared/section-heading";
import { ProposalStatusBadge } from "@/components/shared/status-badge";
import { PdfDialog } from "@/components/library/pdf-dialog";
import { paperStorageUrl } from "@/components/library/paper-card";
import { ResearcherCard } from "@/components/researchers/researcher-card";
import { getProjectById } from "@/lib/data/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Paper",
};

export default async function LibraryPaperPage({
  params,
}: PageProps<"/library/[id]">) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project || project.draft?.status !== "published") {
    notFound();
  }

  const pdfUrl = project.draft?.pdf_storage_path
    ? paperStorageUrl(project.draft.pdf_storage_path)
    : null;

  return (
    <>
      <PageHeader
        kicker="Public library · Paper"
        title={project.title}
        description={project.abstract}
      >
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <ProposalStatusBadge status={project.status} />
            <span className="rounded-full border border-line bg-paper px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-70">
              {project.target_domain}
            </span>
            {project.draft && (
              <span className="rounded-full border border-line bg-paper px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-70">
                v{project.draft.version}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {pdfUrl && <PdfDialog url={pdfUrl} />}
            {pdfUrl && (
              <a
                href={pdfUrl}
                download
                className="inline-flex items-center gap-1.5 border-b-[1.5px] border-ink pb-0.5 text-sm font-semibold text-ink transition-colors hover:border-green hover:text-green"
              >
                <Download className="size-4" />
                Download PDF
              </a>
            )}
          </div>
        </div>
      </PageHeader>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px]">
        <article className="space-y-6">
          <div>
            <h2 className="mb-2 font-serif text-2xl">Abstract</h2>
            <p className="leading-relaxed text-ink-70">{project.abstract}</p>
          </div>

          {project.draft?.latex_url && (
            <div>
              <h2 className="mb-2 font-serif text-2xl">Source</h2>
              <a
                href={project.draft.latex_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border-b-[1.5px] border-ink pb-0.5 text-sm font-semibold text-ink transition-colors hover:border-green hover:text-green"
              >
                <ExternalLink className="size-4" />
                LaTeX source
              </a>
            </div>
          )}
        </article>

        <aside className="space-y-6">
          {project.author && (
            <div>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-45">
                Author
              </h2>
              <ResearcherCard profile={project.author} />
            </div>
          )}
        </aside>
      </section>
    </>
  );
}