import { articleCss } from "@/html/css";
import type { ColorScheme } from "@/theme/tokens";

/** Floating header zone below the status bar that content must clear (px). */
const HEADER_ZONE = 56;

interface BuildOptions {
  /** Rendered display title (may contain markup, e.g. italics). */
  titleHtml?: string;
  /** Optional short description shown under the title. */
  descriptionHtml?: string;
  /** Top safe-area inset (px); reserves room for the floating header. */
  topInset?: number;
}

/**
 * Wraps the raw `parse.text` HTML in a themed mobile document. `data-theme`
 * selects the palette; the native side can swap it later without a reload.
 * When a title is given it is rendered inline (serif lead header) like the
 * Wikipedia app, so the native nav bar can stay title-less.
 */
export function buildArticleHtml(
  contentHtml: string,
  scheme: ColorScheme,
  { titleHtml, descriptionHtml, topInset = 0 }: BuildOptions = {},
): string {
  const header = titleHtml
    ? `<header class="nec-header"><h1 class="nec-title">${titleHtml}</h1>${
        descriptionHtml ? `<p class="nec-desc">${descriptionHtml}</p>` : ""
      }</header>`
    : "";
  const topPad = topInset + HEADER_ZONE;

  return `<!DOCTYPE html>
<html data-theme="${scheme}" style="--top-pad:${topPad}px">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover">
<style>${articleCss()}</style>
</head>
<body><main id="content">${header}${contentHtml}</main></body>
</html>`;
}
