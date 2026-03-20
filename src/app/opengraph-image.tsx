import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HEXACO Personality Dashboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          {["H", "E", "X", "A", "C", "O"].map((letter) => (
            <div
              key={letter}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "64px",
                height: "64px",
                borderRadius: "12px",
                backgroundColor: "#f3f4f6",
                fontSize: "32px",
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              {letter}
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#111827",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          How well does my AI-agent know me?
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "#6b7280",
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          How I see myself, versus how my AI-agent sees me, versus how someone
          else sees me.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "40px",
            padding: "12px 32px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            borderRadius: "8px",
            fontSize: "22px",
            fontWeight: 600,
          }}
        >
          Check out my profile and create your own
        </div>
      </div>
    ),
    { ...size }
  );
}
