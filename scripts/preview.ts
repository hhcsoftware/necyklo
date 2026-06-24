import fs from "node:fs";

import { ARTICLE_BRIDGE } from "@/html/bridge";
import { buildArticleHtml } from "@/html/template";

const file = process.argv[2];
const scheme = (process.argv[3] as "light" | "dark") ?? "dark";
const topInset = Number(process.argv[4] ?? 0);
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const content: string = data.parse.text;
const title: string = data.parse.displaytitle ?? data.parse.title;

let doc = buildArticleHtml(content, scheme, { titleHtml: title, topInset });
// Mirror the WebView's `baseUrl` so protocol-relative image URLs resolve.
// Use replacer functions so `$` sequences in the bridge (e.g. the regex
// end-anchor `$'`) aren't treated as String.replace special patterns.
doc = doc.replace("<head>", () => `<head><base href="https://necyklopedie.org/">`);
// The bridge normally runs via injectedJavaScript; inline it as a <script> so
// a plain browser applies the same DOM transforms for this static preview.
doc = doc.replace("</body>", () => `<script>${ARTICLE_BRIDGE}</script></body>`);
process.stdout.write(doc);
