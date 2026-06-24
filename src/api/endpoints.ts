import { apiRequest } from "@/api/client";
import type {
  ArticleSection,
  ArticleSummary,
  ParsedArticle,
  RandomPage,
  SearchHit,
  SearchResult,
} from "@/api/types";

export const MAIN_PAGE_TITLE = "Hlavní strana";

interface ParseResponse {
  parse: {
    pageid: number;
    title: string;
    displaytitle: string;
    /** String under formatversion=2; legacy `{ "*": string }` handled defensively. */
    text: string | { "*": string };
    sections?: ArticleSection[];
    images?: string[];
  };
}

/** Fetches rendered article HTML + section outline. Follows redirects. */
export async function parseArticle(
  title: string,
  signal?: AbortSignal,
): Promise<ParsedArticle> {
  const { parse } = await apiRequest<ParseResponse>(
    {
      action: "parse",
      page: title,
      prop: "text|sections|displaytitle|images",
      redirects: true,
    },
    signal,
  );
  return {
    pageid: parse.pageid,
    title: parse.title,
    displayTitle: parse.displaytitle,
    html: typeof parse.text === "string" ? parse.text : (parse.text?.["*"] ?? ""),
    sections: parse.sections ?? [],
    images: parse.images ?? [],
  };
}

export function parseMainPage(signal?: AbortSignal): Promise<ParsedArticle> {
  return parseArticle(MAIN_PAGE_TITLE, signal);
}

interface SummaryResponse {
  query?: {
    pages?: {
      pageid?: number;
      title: string;
      missing?: boolean;
      extract?: string;
      fullurl?: string;
      thumbnail?: { source: string; width: number; height: number };
    }[];
  };
}

/** Fetches the lead extract + thumbnail for an article card. */
export async function getSummary(
  title: string,
  signal?: AbortSignal,
): Promise<ArticleSummary> {
  const data = await apiRequest<SummaryResponse>(
    {
      action: "query",
      prop: "extracts|pageimages|info",
      exintro: true,
      explaintext: true,
      pithumbsize: 400,
      inprop: "url",
      redirects: true,
      titles: title,
    },
    signal,
  );
  const page = data.query?.pages?.[0];
  return {
    pageid: page?.pageid,
    title: page?.title ?? title,
    extract: page?.extract ?? "",
    thumbnail: page?.thumbnail?.source,
    fullurl: page?.fullurl,
    missing: page?.missing ?? !page,
  };
}

interface SearchResponse {
  query?: { search?: SearchHit[] };
}

/** Full-text search (article namespace) with snippet highlights. */
export async function searchArticles(
  query: string,
  signal?: AbortSignal,
): Promise<SearchHit[]> {
  if (!query.trim()) return [];
  const data = await apiRequest<SearchResponse>(
    {
      action: "query",
      list: "search",
      srsearch: query,
      srnamespace: 0,
      srlimit: 20,
    },
    signal,
  );
  return data.query?.search ?? [];
}

interface PrefixResponse {
  query?: {
    pages?: {
      pageid: number;
      title: string;
      /** Prefix ranking position (generator results arrive unordered). */
      index: number;
      thumbnail?: { source: string };
    }[];
  };
}

/**
 * Prefix (title) search with thumbnails. Unlike full-text, this matches
 * partial queries — "Libe" resolves to "Liberec" — which the wiki's
 * tokenized DB search (no CirrusSearch here) cannot do.
 */
export async function prefixSearchArticles(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const data = await apiRequest<PrefixResponse>(
    {
      action: "query",
      generator: "prefixsearch",
      gpssearch: query,
      gpsnamespace: 0,
      gpslimit: 10,
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: 160,
    },
    signal,
  );
  const pages = data.query?.pages ?? [];
  return pages
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((p) => ({ pageid: p.pageid, title: p.title, thumbnail: p.thumbnail?.source }));
}

/**
 * Combined search the UI uses: title (prefix) matches first — so partial
 * queries resolve and carry thumbnails — then full-text content matches for
 * related articles. Deduped by page id; a page found by both keeps its
 * thumbnail and gains the full-text snippet.
 */
export async function searchEverything(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  // Tolerate one source failing (e.g. a flaky full-text request) rather than
  // dropping the whole search; only error if both fail.
  const [prefixR, fullR] = await Promise.allSettled([
    prefixSearchArticles(query, signal),
    searchArticles(query, signal),
  ]);
  if (prefixR.status === "rejected" && fullR.status === "rejected") {
    throw prefixR.reason;
  }
  const prefix = prefixR.status === "fulfilled" ? prefixR.value : [];
  const full = fullR.status === "fulfilled" ? fullR.value : [];
  const byId = new Map<number, SearchResult>();
  const order: number[] = [];
  for (const p of prefix) {
    byId.set(p.pageid, { pageid: p.pageid, title: p.title, thumbnail: p.thumbnail });
    order.push(p.pageid);
  }
  for (const f of full) {
    const existing = byId.get(f.pageid);
    if (existing) {
      existing.snippet = f.snippet;
    } else {
      byId.set(f.pageid, { pageid: f.pageid, title: f.title, snippet: f.snippet });
      order.push(f.pageid);
    }
  }
  return order.map((id) => byId.get(id) as SearchResult);
}

interface RandomResponse {
  query?: { random?: RandomPage[] };
}

/** Random articles (article namespace) for the Explore shuffle. */
export async function randomArticles(
  count = 10,
  signal?: AbortSignal,
): Promise<RandomPage[]> {
  const data = await apiRequest<RandomResponse>(
    { action: "query", list: "random", rnnamespace: 0, rnlimit: count },
    signal,
  );
  return data.query?.random ?? [];
}
