import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit .next/standalone with a minimal server.js for a small Docker runtime image.
  output: "standalone",
};

export default nextConfig;
