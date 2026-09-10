import type { NextConfig } from "next";
import { contentSecurityPolicy } from "./lib/ads";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  transpilePackages: ["@hxsl/tool-registry", "@hxsl/processing-shared"],
  output: "standalone",
  // Local data and deployment secrets never belong in the traced standalone artifact.
  outputFileTracingExcludes: { "/*": ["./.data/**/*", "./**/*.sqlite", "./**/*.sqlite-*", "./.env*", "../../.env*"] },
  poweredByHeader: false,
  // Keep localized metadata in the initial head, including ordinary browsers.
  htmlLimitedBots: /.*/,
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: contentSecurityPolicy() },
    ];
    return [
      { source: "/api/:path*", headers: [...security, { key: "Cache-Control", value: "no-store" }] },
      { source: "/:all*(svg|jpg|jpeg|png|webp|ico|woff2)", headers: [...security, { key: "Cache-Control", value: "public, max-age=86400" }] },
      { source: "/(.*)", headers: [...security, { key: "Cache-Control", value: "public, s-maxage=120, stale-while-revalidate=600" }] },
    ];
  }
};

export default nextConfig;
