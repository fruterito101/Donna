import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The monorepo packages ship TypeScript source: Next compiles them.
  transpilePackages: ["@donna/agent-client", "@donna/rules-engine"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
