// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // Needed for absolute URLs in the RSS feed.
  site: "https://guicciardi.net",
  // The design styles <pre> itself; Shiki would inject inline colours over it.
  markdown: { syntaxHighlight: false },
  // Umami analytics. Both are optional: without them (local development, forks)
  // no tracking script is rendered.
  env: {
    schema: {
      UMAMI_SCRIPT_URL: envField.string({
        context: "client",
        access: "public",
        optional: true,
        startsWith: "https://",
      }),
      UMAMI_WEBSITE_ID: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
    },
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Familjen Grotesk",
      cssVariable: "--font-familjen-grotesk",
      weights: [400, 500, 600, 700],
      styles: ["normal", "italic"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "IBM Plex Mono",
      cssVariable: "--font-ibm-plex-mono",
      weights: [400, 500],
      styles: ["normal"],
      fallbacks: ["monospace"],
    },
  ],
});
