import { apiRequest } from "@/api/client";
import type {
  ArticleSection,
  ArticleSummary,
  ParsedArticle,
  RandomPage,
  SearchHit,
  Suggestion,
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

/** OpenSearch autocomplete. Returns a 4-element tuple, ignoring formatversion. */
type OpenSearchResponse = [string, string[], string[], string[]];

export async function suggestArticles(
  query: string,
  signal?: AbortSignal,
): Promise<Suggestion[]> {
  if (!query.trim()) return [];
  const [, titles = [], descriptions = []] = await apiRequest<OpenSearchResponse>(
    { action: "opensearch", search: query, namespace: 0, limit: 10 },
    signal,
  );
  return titles.map((title, i) => ({ title, description: descriptions[i] ?? "" }));
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
