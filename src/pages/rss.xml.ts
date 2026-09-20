import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { site } from "../data/site";
import { getWriting } from "../lib/content";

export async function GET(context: APIContext) {
  const writing = await getWriting();

  return rss({
    title: `${site.name}: writing`,
    description: site.description,
    // Astro.site is set in astro.config.mjs; context.site can't be undefined here.
    site: context.site!,
    items: writing.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.data.excerpt,
      categories: [entry.data.category, ...entry.data.tags],
      link: `/posts/${entry.id}/`,
    })),
  });
}
