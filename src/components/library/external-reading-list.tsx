import type { ExternalReading } from "@/lib/types";

export function ExternalReadingList({
  readings,
}: {
  readings: ExternalReading[];
}) {
  return (
    <section className="border-t border-line pt-12">
      <div className="mb-6">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
          External reading
        </p>
        <h2 className="font-serif text-3xl tracking-tight text-ink">
          Sources outside AAIR Labs
        </h2>
        <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-ink-70">
          Recommended by AAIR Labs. These works were not produced by AAIR Labs.
          The note under each title is context from the lab.
        </p>
      </div>

      {readings.length === 0 ? (
        <p className="text-sm text-ink-45">No external reading has been added yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {readings.map((reading) => (
            <li
              key={reading.id}
              className="flex flex-col gap-3 border border-line bg-surface p-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-45">
                External reading
              </p>
              <h3 className="font-serif text-2xl leading-tight">{reading.title}</h3>
              <p className="text-[11.5px] font-semibold uppercase tracking-wider text-ink-45">
                {reading.authors}
                {reading.venue ? ` · ${reading.venue}` : ""}
                {reading.published_year ? ` · ${reading.published_year}` : ""}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-70">
                {reading.context}
              </p>
              <a
                href={reading.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex w-fit border-b-[1.5px] border-ink pb-0.5 text-[13px] font-semibold text-ink transition-colors hover:border-green hover:text-green"
              >
                Read at source
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
