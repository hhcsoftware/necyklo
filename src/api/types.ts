/** Shapes returned by the Necyklopedie MediaWiki API (formatversion=2). */

export interface ArticleSection {
  toclevel: number;
  /** Heading level as a string, e.g. "2". */
  level: string;
  /** Heading text. */
  line: string;
  /** TOC number, e.g. "1.2". */
  number: string;
  index: string;
  /** Fragment id to scroll to. */
  anchor: string;
}

export interface ParsedArticle {
  pageid: number;
  /** Canonical (possibly redirect-resolved) title; used as the route key. */
  title: string;
  /** Display title — may contain HTML markup. */
  displayTitle: string;
  /** Rendered article HTML (the `parse.text` blob). */
  html: string;
  sections: ArticleSection[];
  /** File names referenced on the page. */
  images: string[];
}

export interface ArticleSummary {
  pageid?: number;
  title: string;
  /** Plain-text intro extract. */
  extract: string;
  thumbnail?: string;
  /** Canonical web URL (from inprop=url). */
  fullurl?: string;
  missing: boolean;
}

export interface SearchHit {
  pageid: number;
  title: string;
  /** HTML snippet with <span class="searchmatch"> highlights. */
  snippet: string;
}

export interface SearchResult {
  pageid: number;
  title: string;
  /** Thumbnail — carried by title (prefix) matches via pageimages. */
  thumbnail?: string;
  /** HTML snippet with <span class="searchmatch"> highlights — full-text matches. */
  snippet?: string;
}

export interface RandomPage {
  id: number;
  title: string;
}
