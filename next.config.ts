import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/webp"],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    const scriptSrc =
      process.env.NODE_ENV === "development"
        ? "script-src 'self' blob: 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval';"
        : "script-src 'self' blob: 'unsafe-inline' 'wasm-unsafe-eval';";

    return [
      {
        source: "/agent-mail-dashboard/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/agent-mail-dashboard/manifest.v1.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=0, must-revalidate" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; ${scriptSrc} style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: wss:;`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
