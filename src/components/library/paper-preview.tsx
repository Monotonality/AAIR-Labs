"use client";

import Image from "next/image";
import { useState } from "react";
import { FileText } from "lucide-react";

interface PaperPreviewProps {
  src: string;
  title: string;
}

export function PaperPreview({ src, title }: PaperPreviewProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="grid aspect-[8.5/11] place-items-center rounded-[2px] border border-dashed border-line bg-surface px-6 text-center">
        <div className="space-y-2 text-ink-45">
          <FileText className="mx-auto" />
          <p className="text-sm">Preview unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[8.5/11] overflow-hidden rounded-[2px] border border-line bg-surface">
      <Image
        src={src}
        alt={`${title} — first page`}
        fill
        sizes="(min-width: 1024px) 380px, 100vw"
        className="object-cover object-top"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
