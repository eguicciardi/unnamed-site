import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintPluginAstro from "eslint-plugin-astro";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["dist/", ".astro/"] },

  // Scoped to JS/TS on purpose: these configs set a parser, and left unscoped
  // they override the Astro parser on .astro files, which then fail to parse.
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended", tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  {
    files: ["**/*.{jsx,tsx}"],
    extends: [pluginReact.configs.flat.recommended],
    settings: { react: { version: "detect" } },
  },

  // Must stay last so nothing downstream replaces the Astro parser.
  ...eslintPluginAstro.configs.recommended,
]);
