import { MARKETING_ACCENT } from "@/lib/marketing/template";
import type { SpotlightFields } from "@/lib/marketing/spotlight-template";

const SPEC = {
  square: {
    width: 1080,
    height: 1080,
    padding: "56px 80px 56px",
    middleGap: 28,
    photoSize: 340,
    photoOffset: 36,
    nameSize: 60,
    blurbSize: 26,
  },
  story: {
    width: 1080,
    height: 1920,
    padding: "250px 80px 270px",
    middleGap: 56,
    photoSize: 640,
    photoOffset: 56,
    nameSize: 110,
    blurbSize: 32,
  },
} as const;

/**
 * The Member Spotlight post, reproduced from the AAIR Assets marketing
 * template. Rendered at full resolution and also scaled down for previews.
 */
export function SpotlightPost({
  variant,
  fields,
  logoUrl,
  appliedLogoUrl,
  photoUrl,
}: {
  variant: "square" | "story";
  fields: SpotlightFields;
  logoUrl: string;
  appliedLogoUrl: string;
  photoUrl: string | null;
}) {
  const spec = SPEC[variant];
  const { photoSize, photoOffset } = spec;

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
          style={{ width: 130, height: 130 }}
        />
        <div
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontWeight: 900,
            fontSize: 60,
            lineHeight: 0.95,
            textAlign: "right",
            textTransform: "uppercase",
          }}
        >
          {fields.memberLine}
          <br />
          <span style={{ color: MARKETING_ACCENT }}>{fields.spotlightLine}</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: spec.middleGap,
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: photoSize,
            height: photoSize,
            margin: `0 ${photoOffset}px ${photoOffset}px 0`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: photoOffset,
              top: photoOffset,
              width: photoSize,
              height: photoSize,
              background: MARKETING_ACCENT,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: photoSize,
              height: photoSize,
              background: "#D9D9D9",
              color: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
              overflow: "hidden",
            }}
          >
            {photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={photoUrl}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              "[SQUARE PHOTO]"
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontWeight: 900,
              fontSize: spec.nameSize,
              lineHeight: 0.95,
              textTransform: "uppercase",
            }}
          >
            {fields.name}
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 2,
              color: MARKETING_ACCENT,
            }}
          >
            {fields.role}
          </div>
          <div style={{ fontSize: spec.blurbSize, lineHeight: 1.4 }}>
            {fields.blurb}
          </div>
        </div>
      </div>

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
          style={{ height: 100 }}
        />
        <div style={{ fontSize: 26, fontWeight: 700, textAlign: "right" }}>
          {fields.handle}
        </div>
      </div>
    </div>
  );
}
