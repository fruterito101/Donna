import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The monorepo packages ship TypeScript source: Next compiles them.
  transpilePackages: ["@dona/agent-client", "@dona/rules-engine"],
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
