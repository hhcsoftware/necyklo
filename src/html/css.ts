import { palettes } from "@/theme/tokens";

const l = palettes.light;
const d = palettes.dark;

/** Mobile reading stylesheet with light/dark variables driven by `data-theme`. */
export function articleCss(): string {
  return `
*{box-sizing:border-box;}
html{-webkit-text-size-adjust:100%;}
[data-theme="light"]{--bg:${l.background};--fg:${l.text};--muted:${l.textMuted};--link:${l.link};--border:${l.border};--alt:${l.surfaceAlt};}
[data-theme="dark"]{--bg:${d.background};--fg:${d.text};--muted:${d.textMuted};--link:${d.link};--border:${d.border};--alt:${d.surfaceAlt};}
html,body{margin:0;padding:0;background:var(--bg);color:var(--fg);}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif;font-size:17px;line-height:1.62;padding:12px 16px 72px;overflow-wrap:break-word;}
main{max-width:720px;margin:0 auto;}
a{color:var(--link);text-decoration:none;}
a.new{color:${l.danger};}
p{margin:0 0 14px;}
img{max-width:100%;height:auto;border-radius:2px;}
h1,h2,h3,h4{line-height:1.3;font-weight:700;margin:24px 0 8px;}
h1,h2{border-bottom:1px solid var(--border);padding-bottom:4px;}
h2{font-size:1.4em;}h3{font-size:1.2em;}h4{font-size:1.05em;}
ul,ol{padding-left:22px;margin:0 0 14px;}
li{margin:2px 0;}
hr{border:0;border-top:1px solid var(--border);margin:20px 0;}
blockquote{margin:0 0 14px;padding-left:14px;border-left:3px solid var(--border);color:var(--muted);}
table{border-collapse:collapse;max-width:100%;}
table,th,td{border-color:var(--border);}
.mw-parser-output table.wikitable,.mw-parser-output table.infobox{display:block;overflow-x:auto;width:100%!important;}
.wikitable{background:var(--alt);}
.wikitable th,.wikitable td{border:1px solid var(--border);padding:6px 8px;}
.infobox{margin:0 0 16px;padding:8px;background:var(--alt);border:1px solid var(--border);border-radius:6px;float:none!important;}
.thumb,.thumbinner{background:var(--alt);border:1px solid var(--border);border-radius:6px;}
.thumb{margin:0 0 16px;padding:6px;width:auto!important;float:none!important;}
.thumbcaption,figcaption{font-size:0.85em;color:var(--muted);padding-top:4px;}
figure{margin:0 0 16px;}
sup.reference{font-size:0.72em;}
.references{font-size:0.88em;color:var(--muted);}
/* Hide editing chrome and navigation cruft; keep article flavor (joke boxes). */
.mw-editsection,.mw-jump-link,.noprint,.navbox,.vertical-navbox,.catlinks,.printfooter,.mw-empty-elt,#toc,.toc,.sistersitebox{display:none!important;}
`;
}
