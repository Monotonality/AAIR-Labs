"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PdfDialog({ url }: { url: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <FileText className="size-4" />
        Read PDF
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Paper PDF viewer"
          className="fixed inset-0 z-50 flex flex-col bg-ink/85 p-4 sm:p-8"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <div
            className="absolute inset-0"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex h-full flex-col">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-paper/70">
                Paper preview
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 text-sm text-paper/70 transition-colors hover:text-white"
                aria-label="Close PDF viewer"
              >
                <X className="size-4" /> Close
              </button>
            </div>
            <iframe
              src={url}
              title="Paper PDF"
              className="h-full w-full border border-line bg-surface"
            />
          </div>
        </div>
      )}
    </>
  );
}