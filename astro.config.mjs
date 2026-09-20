// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Needed for absolute URLs in the RSS feed.
  site: "https://guicciardi.net",
  // The design styles <pre> itself; Shiki would inject inline colours over it.
  markdown: { syntaxHighlight: false },
  vite: {
    plugins: [tailwindcss()],
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
