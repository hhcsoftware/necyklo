export const WIKI_ORIGIN = "https://necyklopedie.org";
const WIKI_PREFIX = "/wiki/";

export interface WikiTarget {
  title: string;
  anchor?: string;
}

/** Builds the canonical public article URL for sharing (spaces → underscores). */
export function articleUrl(title: string): string {
  return `${WIKI_ORIGIN}/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
}

/** Underscores → spaces, percent-decoded. MediaWiki treats the two as equal. */
export function normalizeTitle(raw: string): string {
  try {
    return decodeURIComponent(raw).replace(/_/g, " ").trim();
  } catch {
    return raw.replace(/_/g, " ").trim();
  }
}

/**
 * Parses an internal `/wiki/Title#anchor` link (absolute or relative) into a
 * target. Returns null for non-article or off-site links. RN-safe (no `URL`).
 */
export function parseWikiLink(href: string): WikiTarget | null {
  let rest = href;
  const abs = href.match(/^https?:\/\/([^/]+)(\/.*)?$/i);
  if (abs) {
    const host = abs[1].toLowerCase();
    if (host !== "necyklopedie.org" && host !== "www.necyklopedie.org") return null;
    rest = abs[2] ?? "";
  }
  if (!rest.startsWith(WIKI_PREFIX)) return null;
  rest = rest.slice(WIKI_PREFIX.length);
  const hashIndex = rest.indexOf("#");
  const anchor =
    hashIndex >= 0 ? decodeURIComponent(rest.slice(hashIndex + 1)) : undefined;
  const title = normalizeTitle(hashIndex >= 0 ? rest.slice(0, hashIndex) : rest);
  return title ? { title, anchor } : null;
}

/**
 * Pulls distinct article titles out of a rendered HTML blob (e.g. the main
 * page) by scanning `/wiki/` links. Skips non-article namespaces (those with a
 * `:` such as Soubor:, Kategorie:, Necyklopedie:) and the given excludes.
 */
export function extractArticleLinks(
  html: string,
  limit = 12,
  exclude: string[] = [],
): string[] {
  const excluded = new Set(exclude);
  const seen = new Set<string>();
  const titles: string[] = [];
  const re = /href="(\/wiki\/[^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null && titles.length < limit) {
    const target = parseWikiLink(match[1]);
    if (!target) continue;
    const { title } = target;
    if (title.includes(":") || seen.has(title) || excluded.has(title)) continue;
    seen.add(title);
    titles.push(title);
  }
  return titles;
}

/** Strips HTML tags and decodes common entities for native text display. */
export function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)));
}
