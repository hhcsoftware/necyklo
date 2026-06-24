import { palettes } from "@/theme/tokens";

const l = palettes.light;
const d = palettes.dark;

/**
 * Mobile reading stylesheet, tuned to mimic the Wikipedia app: a full-bleed
 * hero image, a serif lead title and serif section headers, frameless figures,
 * and floated "sidebar" tables folded into a collapsible card.
 *
 * Necyklopedie hand-formats articles with inline `float`/`align`/`width` and
 * light inline backgrounds rather than the standard `.infobox`/`.wikitable`
 * classes, so the resets here lean on attribute selectors + `!important` to
 * neutralize that inline styling for linear phone reading. The bridge also
 * fixes text contrast on inline-coloured boxes. Light/dark via `data-theme`.
 */
export function articleCss(): string {
  return `
*{box-sizing:border-box;}
html{-webkit-text-size-adjust:100%;touch-action:manipulation;}
:root{
  --serif:Georgia,"Times New Roman","Noto Serif",serif;
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif;
}
[data-theme="light"]{--bg:${l.background};--fg:${l.text};--muted:${l.textMuted};--link:${l.link};--border:${l.border};--alt:${l.surfaceAlt};--new:${l.danger};--img-outline:rgba(0,0,0,0.1);}
[data-theme="dark"]{--bg:${d.background};--fg:${d.text};--muted:${d.textMuted};--link:${d.link};--border:${d.border};--alt:${d.surfaceAlt};--new:${d.danger};--img-outline:rgba(255,255,255,0.1);}
html,body{margin:0;padding:0;background:var(--bg);color:var(--fg);}
body{font-family:var(--sans);font-size:15px;line-height:1.55;padding:0 16px 96px;overflow-wrap:break-word;-webkit-font-smoothing:antialiased;}
main{max-width:720px;margin:0 auto;}
a{color:var(--link);text-decoration:none;}
a.new{color:var(--new);}
p{margin:0 0 14px;text-wrap:pretty;}
img{max-width:100%;height:auto;}

/* Neutralize the wiki's hand-rolled floats/alignment so everything stacks
   vertically and reads top-to-bottom, the way a phone article should. */
[style*="float"]{float:none!important;}
[align="right"],[align="left"],[align="center"]{float:none!important;}
center{display:block;}
big{font-size:1.05em;}

/* Full-bleed hero (the lead infobox image, promoted by the bridge). Excluded
   from the generic figure reset below so its negative margins survive and it
   spans edge to edge. Fixed height + cover guarantees full width. */
.nec-hero{margin:0 -16px 16px;background:var(--alt);line-height:0;}
.nec-hero img{display:block;width:100%;height:230px;object-fit:cover;border-radius:0;box-shadow:none;}

/* Lead title block — serif title the Wikipedia app shows inline at the top of
   the article body, with a short rule beneath it. */
.nec-header{padding:16px 0 14px;}
.nec-title{font-family:var(--serif);font-weight:400;font-size:1.9em;line-height:1.16;margin:0 0 6px;letter-spacing:-0.01em;text-wrap:balance;}
.nec-title i,.nec-title em{font-style:italic;}
.nec-desc{color:var(--muted);font-size:0.95em;line-height:1.35;margin:0;}

/* Section headings: H2 in serif like the app; deeper levels bold sans. */
h1{font-family:var(--serif);font-weight:400;}
h2{font-family:var(--serif);font-weight:400;font-size:1.5em;line-height:1.22;margin:28px 0 11px;padding-top:16px;border-top:1px solid var(--border);text-wrap:balance;}
h3{font-family:var(--sans);font-weight:700;font-size:1.2em;line-height:1.3;margin:22px 0 9px;text-wrap:balance;}
h4{font-family:var(--sans);font-weight:700;font-size:1.0em;line-height:1.3;margin:18px 0 8px;text-wrap:balance;}
.mw-headline{font:inherit;color:inherit;}

/* Hatnotes / redirect & disambiguation notes: italic, indented, muted. */
.hatnote,.dablink,.rellink{font-style:italic;color:var(--muted);font-size:0.94em;padding-left:14px;margin:0 0 15px;}

ul,ol{padding-left:24px;margin:0 0 15px;}
li{margin:3px 0;}
hr{border:0;border-top:1px solid var(--border);margin:22px 0;}
blockquote{margin:0 0 15px;padding-left:14px;border-left:3px solid var(--border);color:var(--muted);}

/* Figures / thumbnails — frameless, centered, sized to fit (never upscaled,
   never taller than this cap). */
figure:not(.nec-hero),.thumb,.thumbinner,.tright,.tleft,.tnone,.floatright,.floatleft,.center{width:auto!important;max-width:100%!important;margin:0 auto 16px;padding:0;border:0;background:transparent;}
.thumb img,.thumbinner img,figure:not(.nec-hero) img,.image img{display:block;max-width:100%;width:auto;height:auto;max-height:420px;margin:0 auto;border-radius:3px;box-shadow:0 0 0 1px var(--img-outline);}
.thumbcaption,figcaption{font-size:0.85em;color:var(--muted);text-align:center;padding:7px 6px 0;}

/* Runs of adjacent thumbnails → a swipeable horizontal gallery (grouped by the
   bridge) instead of a tall vertical stack of full-width images. */
.nec-gallery{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;margin:0 -16px 16px;padding:0 16px;scrollbar-width:none;}
.nec-gallery::-webkit-scrollbar{display:none;}
.nec-gallery .thumb{flex:0 0 84%;width:84%!important;max-width:84%!important;margin:0!important;scroll-snap-align:center;}
.nec-gallery .thumbinner{width:100%!important;max-width:none!important;}
.nec-gallery .thumb img{width:100%;height:200px;object-fit:cover;border-radius:4px;}
.nec-gallery .thumbcaption,.nec-gallery figcaption{padding:6px 2px 0;}

/* MediaWiki <gallery> tag → simple centered stack. */
ul.gallery{display:block;margin:0 0 16px;padding:0;list-style:none;}
li.gallerybox,li.gallerybox > div{width:auto!important;margin:0 auto 14px;}
li.gallerybox img{margin:0 auto;}
.gallerytext{font-size:0.85em;color:var(--muted);text-align:center;padding-top:6px;}

/* Hand-styled notice/ambox boxes ("Tento článek ..."), tamed by the bridge:
   thin themed bar instead of a thick white/black one, no leftover indent. */
.nec-note{width:auto!important;border:1px solid var(--border)!important;border-radius:8px;padding:11px 13px;margin:0 0 14px;font-size:0.94em;}
.nec-note [style*="border-left"]{border-left-color:var(--border)!important;}
.nec-note .image img,.nec-note img{box-shadow:none;margin:0 0 6px;}
code,kbd,samp{font-size:0.92em;overflow-wrap:break-word;}

/* Any remaining wide table gets a horizontal-scroll wrapper from the bridge. */
table{max-width:100%!important;font-size:0.95em;}
.nec-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 0 16px;}
.nec-scroll table{margin:0!important;}

/* Floated/narrow "sidebar" tables → collapsible "Stručná fakta" card, themed
   to match the app (dark in dark mode) so the wiki's light inline row
   backgrounds don't render as invisible light-on-light text. */
.nec-collapsible{border:1px solid var(--border);border-radius:8px;overflow:hidden;margin:0 0 16px;}
.nec-collapsible-bar{display:flex;align-items:center;gap:8px;width:100%;border:0;background:var(--alt);color:var(--fg);font-family:var(--sans);font-size:0.95em;text-align:left;padding:12px 14px;cursor:pointer;}
.nec-collapsible-label{font-weight:700;flex-shrink:0;}
.nec-collapsible-sub{color:var(--muted);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.nec-collapsible-chevron{color:var(--muted);font-size:0.85em;transition:transform .18s ease;}
.nec-collapsible.nec-open .nec-collapsible-chevron{transform:rotate(180deg);}
.nec-collapsible-body{border-top:1px solid var(--border);}
.nec-collapsible-body table{width:100%!important;margin:0!important;float:none!important;border:0!important;font-size:0.92em;}
.nec-collapsible-body table,.nec-collapsible-body tbody,.nec-collapsible-body tr,.nec-collapsible-body th,.nec-collapsible-body td{background:transparent!important;color:var(--fg)!important;border-color:var(--border)!important;}
.nec-collapsible-body th,.nec-collapsible-body td{padding:7px 11px;border-width:0 0 1px;border-style:solid;text-align:left;vertical-align:top;}
.nec-collapsible-body a{color:var(--link)!important;}
.nec-collapsible-body img{max-height:240px;}

sup.reference{font-size:0.72em;}
.references{font-size:0.86em;color:var(--muted);}
.references li{margin:6px 0;}

/* Hide editing chrome and navigation cruft; keep article flavor (joke boxes). */
.mw-editsection,.mw-jump-link,.noprint,.navbox,.vertical-navbox,.catlinks,.printfooter,.mw-empty-elt,#toc,.toc,.toctitle,.sistersitebox,.shortdescription{display:none!important;}
`;
}
