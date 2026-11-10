// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "robots.txt", "sitemap.xml"],
        manifest: {
          id: "/",
          name: "ChemStudio — Scientific Vector Workbench & Reaction Studio",
          short_name: "ChemStudio",
          description:
            "Publication-grade vector graphics workbench for chemistry papers, reaction schemes, 3D structures, and journal submission dossiers.",
          theme_color: "#06B6D4",
          background_color: "#090d16",
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: [
            {
              src: "/favicon.ico",
              sizes: "64x64 32x32 24x24 16x16",
              type: "image/x-icon",
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.code === "MODULE_LEVEL_DIRECTIVE" ||
            (typeof warning.message === "string" && warning.message.includes('"use client"'))
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
  },
});
