import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { paperStorageUrl } from "@/components/library/paper-card";
import { getProjectById } from "@/lib/data/queries";
import { documentTypeLabel, projectAuthors } from "@/lib/papers";

export const instant = false;

export const metadata: Metadata = {
  title: "Paper",
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

function summarize(text: string, max = 220) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^[\s\S]*?[.!?](\s|$)/);
  const first = (match ? match[0] : trimmed).trim();
  if (first.length <= max) return first;
  return `${first.slice(0, max).replace(/\s+\S*$/, "")}\u2026`;
}

export default async function LibraryPaperPage({
  params,
}: PageProps<"/library/[id]">) {
  const { id } = await params;
  await connection();
  const project = await getProjectById(id);

  const isPublic =
    project?.draft?.status === "published" ||
    project?.document_type === "working_paper";

  if (!project || !isPublic) {
    notFound();
  }

  const pdfUrl = project.draft?.pdf_storage_path
    ? paperStorageUrl(project.draft.pdf_storage_path)
    : null;

  const previewUrl = project.draft?.pdf_storage_path
    ? paperStorageUrl(project.draft.pdf_storage_path)
    : null;

  const pdfFilename = `${project.title
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()}.pdf`;
  const pdfDownloadUrl = pdfUrl
    ? `${pdfUrl}?download=${encodeURIComponent(pdfFilename)}`
    : null;

  const authors = projectAuthors(project);
  const category = documentTypeLabel(project.document_type);
  const uploaded = project.draft?.created_at ?? project.created_at;
  const summary = summarize(project.abstract);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr] lg:gap-14">
        {/* Main content */}
        <div className="space-y-8">
          <header className="space-y-4">
            <span className="w-fit rounded-[2px] border border-ink bg-ink px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-paper">
              {category}
            </span>
            <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">
              {project.title}
            </h1>
            {authors.length > 0 && (
              <p className="text-base text-ink-70">
                {authors.map((entry, index) => (
                  <span key={entry.profile.id}>
                    {index > 0 && ", "}
                    <Link
                      href={`/researchers/${entry.profile.username}`}
                      className="border-b border-ink font-semibold text-ink transition-colors hover:border-green hover:text-green"
                    >
                      {entry.profile.full_name}
                    </Link>
                  </span>
                ))}
              </p>
            )}
            {summary && (
              <p className="max-w-[62ch] text-base leading-relaxed text-ink-70">
                {summary}
              </p>
            )}
          </header>

          <div className="flex flex-wrap items-center gap-3">
            {pdfUrl && (
              <Button asChild>
                <a href={pdfUrl} rel="noopener noreferrer">
                  <FileText />
                  Read
                </a>
              </Button>
            )}
            {pdfDownloadUrl && (
              <Button asChild variant="outline">
                <a href={pdfDownloadUrl}>
                  <Download />
                  Download PDF
                </a>
              </Button>
            )}
          </div>

          <div className="border-t border-line" />

          <div className="space-y-3">
            <h2 className="font-serif text-2xl">Description</h2>
            <p className="max-w-[70ch] leading-relaxed text-ink-70">
              {project.abstract}
            </p>
          </div>

          <div className="border-t border-line" />

          <div className="space-y-6">
            <h2 className="font-serif text-2xl">Information</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {project.target_domain && (
                <Meta label="Field" value={project.target_domain} />
              )}
              <Meta label="Date uploaded" value={formatDate(uploaded)} />
              <Meta label="Format" value="PDF" />
            </dl>
            {project.topics?.length > 0 && (
              <TagGroup label="Category / Field" tags={project.topics} />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          {pdfUrl ? (
            <div className="overflow-hidden rounded-[2px] border border-line bg-surface">
              <iframe
                src={`${pdfUrl}#page=1&view=FitH&toolbar=0&navpanes=0`}
                title={`${project.title} preview`}
                className="aspect-[8.5/11] w-full"
              />
            </div>
          ) : (
            <div className="grid aspect-[8.5/11] place-items-center rounded-[2px] border border-dashed border-line bg-surface px-6 text-center text-sm text-ink-45">
              No PDF available
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-widest text-ink-45">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

function TagGroup({ label, tags }: { label: string; tags: string[] | undefined }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-45">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="cursor-default rounded-full border border-line bg-paper px-2.5 py-0.5 text-[11.5px] font-semibold text-ink-70 transition-colors hover:border-ink hover:text-ink"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
