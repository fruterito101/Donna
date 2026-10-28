// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const nextExport = process.env["DONNA_BUILD_TARGET"] === "next";
const publicPages = ["/", "/app", "/professional-contact", "/operaciones"];

export default defineConfig({
  // Next serves these documents and owns the APIs; standalone Lovable keeps Nitro.
  ...(nextExport ? {
    nitro: false as const,
    vite: { build: { assetsDir: "donna-assets" } },
  } : {}),
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(nextExport ? {
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: false,
        crawlLinks: false,
        failOnError: true,
      },
      pages: publicPages.map(path => ({ path, prerender: { enabled: true } })),
      sitemap: { enabled: false },
    } : {}),
  },
});
