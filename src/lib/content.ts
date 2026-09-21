import { getCollection, type CollectionEntry } from "astro:content";

type WritingEntry = CollectionEntry<"writing">;

const byDateDesc = <T extends { data: { date: Date } }>(a: T, b: T) =>
  b.data.date.getTime() - a.data.date.getTime();

/** Published writing, newest first. Drafts are visible in dev only. */
export async function getWriting(): Promise<WritingEntry[]> {
  const entries = await getCollection(
    "writing",
    ({ data }) => import.meta.env.DEV || !data.draft,
  );
  return entries.sort(byDateDesc);
}

export async function getLinks(): Promise<LinkEntry[]> {
  return (await getCollection("links")).sort(byDateDesc);
}

/** Reading time from the raw body, at 200 words per minute (never below 1). */
export function readingMinutes(body: string | undefined): number {
  const words = (body ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function domainOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

// Dates come from YAML as UTC midnight, so format in UTC to avoid an off by
// one day for readers west of Greenwich.
const utc = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options });

const dayMonth = utc({ day: "2-digit", month: "short" });
const longDate = utc({ day: "numeric", month: "long", year: "numeric" });

/** 2026.08.14 */
export function formatDotted(date: Date): string {
  return date.toISOString().slice(0, 10).replaceAll("-", ".");
}

/** 14 Aug */
export const formatDayMonth = (date: Date) => dayMonth.format(date);

/** 14 August 2026 */
export const formatLong = (date: Date) => longDate.format(date);

/** Groups newest-first entries by year, preserving order. */
export function groupByYear(entries: WritingEntry[]) {
  const groups = new Map<number, WritingEntry[]>();
  for (const entry of entries) {
    const year = entry.data.date.getUTCFullYear();
    groups.set(year, [...(groups.get(year) ?? []), entry]);
  }
  return [...groups].map(([year, items]) => ({ year, items }));
}
