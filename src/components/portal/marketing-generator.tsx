"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { MarketingPost } from "@/components/portal/marketing-post";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getMarketingFontCss,
  renderNodeToPng,
  urlToDataUrl,
} from "@/lib/marketing/render";
import {
  DEFAULT_MARKETING_FIELDS,
  type MarketingFields,
} from "@/lib/marketing/template";

const MAIN_LOGO = "/marketing/aair-labs-logo.jpg";
const APPLIED_LOGO = "/marketing/applied-ai-research-logo.jpg";

const FONT_FACE_CSS = `
@font-face{font-family:'Archivo';font-style:normal;font-weight:900;font-display:block;src:url('/marketing/fonts/archivo-900.woff2') format('woff2');}
@font-face{font-family:'Space Mono';font-style:normal;font-weight:400;font-display:block;src:url('/marketing/fonts/space-mono-400.woff2') format('woff2');}
@font-face{font-family:'Space Mono';font-style:normal;font-weight:700;font-display:block;src:url('/marketing/fonts/space-mono-700.woff2') format('woff2');}
`;

const FIELDS: {
  key: keyof MarketingFields;
  label: string;
  placeholder?: string;
  wide?: boolean;
}[] = [
  { key: "line1", label: "Big line 1" },
  { key: "line2", label: "Big line 2" },
  { key: "line3", label: "Big line 3 (accent)" },
  { key: "subheader", label: "Subheader", wide: true },
  { key: "date", label: "Date", placeholder: "[DATE]" },
  { key: "time", label: "Time", placeholder: "[TIME]" },
  { key: "location", label: "Location", placeholder: "[LOCATION]" },
  {
    key: "socialEvent",
    label: "Social event label (story only)",
    placeholder: "[SOCIAL EVENT]",
  },
];

const PREVIEW_WIDTH = 320;
const PREVIEW_SCALE = PREVIEW_WIDTH / 1080;

function Preview({
  title,
  variant,
  fields,
  logoUrl,
  appliedLogoUrl,
}: {
  title: string;
  variant: "square" | "story";
  fields: MarketingFields;
  logoUrl: string;
  appliedLogoUrl: string;
}) {
  const height =
    (variant === "story" ? 1920 : 1080) * PREVIEW_SCALE;

  return (
    <div className="space-y-3">
      <h2 className="font-serif text-xl">{title}</h2>
      <div
        className="overflow-hidden border border-line"
        style={{ width: PREVIEW_WIDTH, height }}
      >
        <div
          style={{
            transform: `scale(${PREVIEW_SCALE})`,
            transformOrigin: "top left",
          }}
        >
          <MarketingPost
            variant={variant}
            fields={fields}
            logoUrl={logoUrl}
            appliedLogoUrl={appliedLogoUrl}
          />
        </div>
      </div>
    </div>
  );
}

export function MarketingGenerator() {
  const [fields, setFields] = useState<MarketingFields>(DEFAULT_MARKETING_FIELDS);
  const [logos, setLogos] = useState<{ main: string; applied: string } | null>(
    null,
  );
  const [busy, setBusy] = useState<"square" | "story" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const squareRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    Promise.all([urlToDataUrl(MAIN_LOGO), urlToDataUrl(APPLIED_LOGO)])
      .then(([main, applied]) => {
        if (active) setLogos({ main, applied });
      })
      .catch(() => {
        if (active) setError("Could not load the marketing logos.");
      });
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback((key: keyof MarketingFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const download = useCallback(async (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, []);

  async function handleGenerate(variant: "square" | "story") {
    const node = variant === "square" ? squareRef.current : storyRef.current;
    if (!node) return;
    setBusy(variant);
    setError(null);
    try {
      const fontCss = await getMarketingFontCss();
      const blob =
        variant === "square"
          ? await renderNodeToPng(node, 1080, 1080, fontCss)
          : await renderNodeToPng(node, 1080, 1920, fontCss);
      await download(blob, `tacos-and-technology-${variant}.png`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not generate the image.",
      );
    } finally {
      setBusy(null);
    }
  }

  const logoSrc = logos?.main ?? MAIN_LOGO;
  const appliedSrc = logos?.applied ?? APPLIED_LOGO;

  return (
    <div className="space-y-8">
      <style>{FONT_FACE_CSS}</style>
      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5 rounded-[2px] border border-line bg-surface p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <Field
                key={field.key}
                label={field.label}
                htmlFor={`mkt-${field.key}`}
                wide={field.wide}
              >
                <Input
                  id={`mkt-${field.key}`}
                  value={fields[field.key]}
                  placeholder={field.placeholder}
                  onChange={(e) => update(field.key, e.target.value)}
                />
              </Field>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <Button
              onClick={() => handleGenerate("square")}
              disabled={busy !== null || !logos}
            >
              {busy === "square"
                ? "Generating..."
                : "Download square (1080×1080)"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleGenerate("story")}
              disabled={busy !== null || !logos}
            >
              {busy === "story"
                ? "Generating..."
                : "Download story (1080×1920)"}
            </Button>
            <span className="text-xs text-ink-45">
              The 4×5 version is not generated.
            </span>
          </div>
        </div>

        <div className="space-y-8">
          <Preview
            title="Post square"
            variant="square"
            fields={fields}
            logoUrl={logoSrc}
            appliedLogoUrl={appliedSrc}
          />
          <Preview
            title="Story"
            variant="story"
            fields={fields}
            logoUrl={logoSrc}
            appliedLogoUrl={appliedSrc}
          />
        </div>
      </div>

      <div
        aria-hidden
        style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }}
      >
        <div ref={squareRef}>
          <MarketingPost
            variant="square"
            fields={fields}
            logoUrl={logoSrc}
            appliedLogoUrl={appliedSrc}
          />
        </div>
        <div ref={storyRef}>
          <MarketingPost
            variant="story"
            fields={fields}
            logoUrl={logoSrc}
            appliedLogoUrl={appliedSrc}
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  wide,
  children,
}: {
  label: string;
  htmlFor: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
