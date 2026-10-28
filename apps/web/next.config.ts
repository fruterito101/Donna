import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The monorepo packages ship TypeScript source: Next compiles them.
  transpilePackages: ["@donna/agent-client", "@donna/rules-engine", "@donna/frontend"],
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/donna/index.html" },
        { source: "/app", destination: "/donna/app/index.html" },
        { source: "/professional-contact", destination: "/donna/professional-contact/index.html" },
        { source: "/operaciones", destination: "/donna/operaciones/index.html" },
        { source: "/donna-assets/:path*", destination: "/donna/donna-assets/:path*" },
        { source: "/favicon.svg", destination: "/donna/favicon.svg" },
      ],
    };
  },
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
