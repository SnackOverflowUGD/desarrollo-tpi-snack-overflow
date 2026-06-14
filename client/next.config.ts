import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit .next/standalone with a minimal server.js for a small Docker runtime image.
  output: "standalone",

  // Same-origin proxy for the NestJS backend.
  // The backend has NO CORS enabled and exposes routes without a global prefix
  // (e.g. POST /auth/register on :3000). Calling it cross-origin from the browser
  // would be blocked, so the client always calls relative `/api/:path*` and Next
  // rewrites it to the backend. BACKEND_URL is a server-only env var (no
  // NEXT_PUBLIC_ needed — the browser only ever sees the relative path).
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL ?? "http://localhost:3000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
