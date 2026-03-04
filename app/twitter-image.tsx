import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/content";

export const runtime = "edge";
const subtitle = "Coordination Infrastructure for AI Coding Agents";
const siteHost = new URL(siteConfig.url).hostname;

export const alt = `${siteConfig.name} — ${subtitle}`;
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

export default function Image() {
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
          background: "linear-gradient(145deg, #020a14 0%, #0a1628 50%, #020a14 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top-left glow */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "-120px",
            width: "400px",
            height: "400px",
            borderRadius: "9999px",
            background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Bottom-right glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "350px",
            height: "350px",
            borderRadius: "9999px",
            background: "radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Orange accent dot */}
        <div
          style={{
            position: "absolute",
            top: "50px",
            right: "70px",
            width: "12px",
            height: "12px",
            borderRadius: "9999px",
            backgroundColor: "#F97316",
            display: "flex",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #3B82F6, #2563EB)",
            marginBottom: "28px",
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: "40px",
              fontWeight: 900,
            }}
          >
            {siteConfig.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: "56px",
            fontWeight: 800,
            color: "#F1F5F9",
            letterSpacing: "-2px",
            lineHeight: 1.1,
          }}
        >
          {siteConfig.name}
        </div>

        {/* Decorative blue line */}
        <div
          style={{
            display: "flex",
            width: "120px",
            height: "4px",
            background: "linear-gradient(90deg, #3B82F6, #60A5FA)",
            borderRadius: "2px",
            marginTop: "24px",
            marginBottom: "24px",
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: "24px",
            fontWeight: 500,
            color: "#93C5FD",
            letterSpacing: "-0.5px",
          }}
        >
          {subtitle}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "18px",
            fontWeight: 500,
            color: "#64748B",
          }}
        >
          <span style={{ color: "#F97316" }}>{">"}</span>
          <span>{siteHost}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
