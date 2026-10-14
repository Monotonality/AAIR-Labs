import { MARKETING_ACCENT } from "@/lib/marketing/template";
import type { MeetingFields } from "@/lib/marketing/meeting-template";

const SPEC = {
  square: {
    width: 1080,
    height: 1080,
    padding: "56px 80px 56px",
    headline: 130,
  },
  story: {
    width: 1080,
    height: 1920,
    padding: "250px 80px 270px",
    headline: 150,
  },
} as const;

/**
 * The General Meeting post, reproduced from the AAIR Assets marketing template.
 * Rendered at full resolution and also scaled down for previews.
 */
export function MeetingPost({
  variant,
  fields,
  logoUrl,
  appliedLogoUrl,
}: {
  variant: "square" | "story";
  fields: MeetingFields;
  logoUrl: string;
  appliedLogoUrl: string;
}) {
  const spec = SPEC[variant];
  const agenda = fields.agenda.filter((item) => item.trim().length > 0);

  return (
    <div
      style={{
        width: spec.width,
        height: spec.height,
        boxSizing: "border-box",
        padding: spec.padding,
        background: "#FFFFFF",
        color: "#000000",
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
          src={appliedLogoUrl}
          alt="Applied Artificial Intelligence Research"
          style={{ height: 130 }}
        />
        <div
          style={{
            background: MARKETING_ACCENT,
            color: "#000000",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 4,
            padding: "14px 24px",
          }}
        >
          {fields.cadence}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 6 }}>
          AAIR LABS · UT DALLAS
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
          {fields.generalLine}
          <br />
          {fields.meetingLine}
        </div>
        <div style={{ width: 220, height: 24, background: MARKETING_ACCENT }} />
        <div style={{ fontSize: 32, lineHeight: 1.4, maxWidth: 860 }}>
          {fields.summary}
        </div>
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: 22, fontSize: 32 }}
      >
        <div style={{ fontWeight: 700, letterSpacing: 4, fontSize: 26 }}>
          ON THE AGENDA
        </div>
        {agenda.map((item, index) => (
          <div key={index} style={{ display: "flex", gap: 20 }}>
            <div
              style={{
                width: 28,
                height: 28,
                background: "#000000",
                flexShrink: 0,
                marginTop: 6,
              }}
            />
            <div>{item}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#000000",
          color: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "32px 40px",
          fontSize: 34,
          fontWeight: 700,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>{fields.date}</div>
          <div style={{ color: MARKETING_ACCENT }}>
            {`${fields.time} · ${fields.location}`}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt="AAIR Labs logo"
          style={{ width: 120, height: 120 }}
        />
      </div>
    </div>
  );
}
