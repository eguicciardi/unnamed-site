import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

// Notes from my own work: one Markdown file per post.
const writing = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/writing" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.string().default("Backend"),
    excerpt: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// The linkblog: things worth reading elsewhere on the web. Data only; every
// entry needs an `id` for the file loader.
const links = defineCollection({
  loader: file("./src/content/links.json"),
  schema: z.object({
    title: z.string(),
    url: z.url(),
    author: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
  }),
});

export const collections = { writing, links };
