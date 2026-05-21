import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Gold diamond accent — a CSS shape, so no special glyph/font is needed. */
function Diamond() {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        backgroundColor: "#d4af37",
        transform: "rotate(45deg)",
      }}
    />
  );
}

/** Social-share preview image, generated at build/request time. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#00171f",
          color: "#ffffff",
          padding: "80px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            color: "#00a8e8",
            fontSize: 26,
            letterSpacing: 8,
          }}
        >
          <Diamond />
          JOY QUOTIENT (JQ) ASSESSMENT
          <Diamond />
        </div>
        <div style={{ fontSize: 90, fontWeight: 700, marginTop: 30 }}>
          Measure what matters.
        </div>
        <div
          style={{
            fontSize: 30,
            color: "rgba(255,255,255,0.65)",
            marginTop: 30,
            maxWidth: 900,
          }}
        >
          A snapshot of how much real, felt joy is present in your life —
          tracked over time.
        </div>
      </div>
    ),
    { ...size },
  );
}
