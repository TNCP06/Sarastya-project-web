import type { NextConfig } from "next";

const apiBaseUrl = (process.env.API_BASE_URL || "http://scd-api:8080").replace(
  /\/+$/,
  "",
);

const nextConfig: NextConfig = {
  // Lean Docker image: bundles only the files the server needs (.next/standalone).
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/papi/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
