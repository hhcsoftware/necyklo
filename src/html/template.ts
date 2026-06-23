import { articleCss } from "@/html/css";
import type { ColorScheme } from "@/theme/tokens";

/**
 * Wraps the raw `parse.text` HTML in a themed mobile document. `data-theme`
 * selects the palette; the native side can swap it later without a reload.
 */
export function buildArticleHtml(contentHtml: string, scheme: ColorScheme): string {
  return `<!DOCTYPE html>
<html data-theme="${scheme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover">
<style>${articleCss()}</style>
</head>
<body><main id="content">${contentHtml}</main></body>
</html>`;
}
