import { MARKETING_ACCENT, type MarketingFields } from "@/lib/marketing/template";

const SPEC = {
  square: { width: 1080, height: 1080, padding: "64px 80px 64px", headline: 118 },
  story: { width: 1080, height: 1920, padding: "250px 80px 270px", headline: 178 },
} as const;

const LABEL_GAP = "\u00A0\u00A0\u00A0";
const WHERE_GAP = "\u00A0\u00A0";

/**
 * The Tacos and Technology post, reproduced from the AAIR Assets marketing
 * template. Rendered at full resolution and also scaled down for previews.
 */
export function MarketingPost({
  variant,
  fields,
  logoUrl,
  appliedLogoUrl,
}: {
  variant: "square" | "story";
  fields: MarketingFields;
  logoUrl: string;
  appliedLogoUrl: string;
}) {
  const spec = SPEC[variant];

  return (
    <div
      style={{
        width: spec.width,
        height: spec.height,
        boxSizing: "border-box",
        padding: spec.padding,
        background: "#000000",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "'Space Mono', monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt="AAIR Labs logo"
          style={{ width: 150, height: 150 }}
        />
        <div
          style={{
            fontSize: 26,
            letterSpacing: 4,
            textAlign: "right",
            lineHeight: 1.5,
          }}
        >
          UT DALLAS
          <br />
          STUDENT ORGANIZATION
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 6,
            color: MARKETING_ACCENT,
          }}
        >
          AAIR LABS PRESENTS
        </div>
        <div
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontWeight: 900,
            fontSize: spec.headline,
            lineHeight: 0.92,
            textTransform: "uppercase",
          }}
        >
          {fields.line1}
          <br />
          {fields.line2}
          <br />
          <span style={{ color: MARKETING_ACCENT }}>{fields.line3}</span>
        </div>
        <div
          style={{
            fontSize: 32,
            lineHeight: 1.4,
            maxWidth: 820,
            textTransform: "uppercase",
          }}
        >
          {fields.subheader}
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ width: 40, height: 40, background: MARKETING_ACCENT }} />
          <div style={{ width: 40, height: 40, background: "#FFFFFF" }} />
          <div style={{ width: 40, height: 40, background: MARKETING_ACCENT }} />
          <div style={{ width: 40, height: 40, background: "#FFFFFF" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            fontSize: 38,
            fontWeight: 700,
          }}
        >
          <div>
            {"DATE" + LABEL_GAP}
            {fields.date || "[DATE]"}
          </div>
          <div>
            {"TIME" + LABEL_GAP}
            {fields.time || "[TIME]"}
          </div>
          <div>
            {"WHERE" + WHERE_GAP}
            {fields.location || "[LOCATION]"}
          </div>
        </div>

        {variant === "story" && (
          <div
            style={{
              background: "#FFFFFF",
              color: "#000000",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 32px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={appliedLogoUrl}
              alt="Applied Artificial Intelligence Research"
              style={{ height: 110 }}
            />
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                textAlign: "right",
                textTransform: "uppercase",
              }}
            >
              {fields.socialEvent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
