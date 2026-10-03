import { ImageResponse } from "next/og";

export const alt = "Founder Desk — compliance cockpit for India–US founders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4efe6",
          color: "#1c1915",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#1b4332",
          }}
        >
          Founder Desk
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 64, lineHeight: 1.1, fontWeight: 500 }}>
            A calm desk for Delaware, IRS, and India filings.
          </div>
          <div style={{ fontSize: 28, color: "#5e584e" }}>
            Calendar, document inbox, and franchise tax checker.
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#5e584e" }}>
          Educational tool, not tax or legal advice.
        </div>
      </div>
    ),
    size,
  );
}
