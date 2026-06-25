/**
 * Injected into the article WebView after load. Runs in the page context: it
 * normalizes image URLs and installs a single delegated click handler that
 * intercepts internal links, images, footnotes, and external links, forwarding
 * each to the native side via `window.ReactNativeWebView.postMessage`.
 *
 * Message shapes (all JSON):
 *   { type: 'link',      payload: { title, anchor } }
 *   { type: 'image',     payload: { src, caption } }
 *   { type: 'reference', payload: { id, text } }
 *   { type: 'external',  payload: { url } }
 *   { type: 'ready',     payload: { height, sections: [{ anchor, top }] } }
 *
 * Must end with `true;` (react-native-webview requirement).
 */
export const ARTICLE_BRIDGE = `
(function () {
  function post(type, payload) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
    }
  }

  // Block pinch / double-tap zoom (WKWebView honors these gestures), so the
  // reader feels like a native screen rather than a zoomable web page.
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (g) {
    document.addEventListener(g, function (e) { e.preventDefault(); }, { passive: false });
  });

  // baseUrl normally resolves protocol-relative images; this is a safety net.
  var imgs = document.querySelectorAll('img');
  for (var i = 0; i < imgs.length; i++) {
    var s = imgs[i].getAttribute('src');
    if (s && s.indexOf('//') === 0) imgs[i].setAttribute('src', 'https:' + s);
  }

  // Turn a MediaWiki thumb URL into the original full-size file URL.
  function fullImageUrl(src) {
    var m = src.match(new RegExp('^(https?:.*)/thumb/(.+)/[^/]+$'));
    return m ? m[1] + '/' + m[2] : src;
  }

  // Necyklopedie uses light inline backgrounds (#fff, #f9f9f9, yellow, ...)
  // assuming dark default text. In our dark theme that text inherits a light
  // colour, so light-on-light goes invisible. Give every element that sets its
  // own background a readable text colour based on the background's lightness.
  function bgLightness(rgb) {
    var m = rgb && rgb.match(/(\\d+)[,\\s]+(\\d+)[,\\s]+(\\d+)/);
    if (!m) return null;
    return (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
  }
  var bgEls = document.querySelectorAll('[style*="background"]');
  for (var n = 0; n < bgEls.length; n++) {
    var be = bgEls[n];
    if (!be.style || (!be.style.backgroundColor && !be.style.background)) continue;
    if (be.style.color) continue; // author set an explicit text colour; respect it
    var bg = window.getComputedStyle(be).backgroundColor;
    if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') continue;
    var lightness = bgLightness(bg);
    if (lightness === null) continue;
    if (lightness >= 0.6) be.style.color = '#202122';
    else if (lightness <= 0.32) be.style.color = '#f8f9fa';
  }

  // Tame hand-styled notice/ambox boxes ("Tento článek ..."): a bordered,
  // ~80%-wide box with a floated icon, a thick white/black quote-bar, a big
  // left indent, and mild upsizing — all of which read badly on a phone.
  function tameNoteBox(box) {
    if (box.closest('.nec-note')) return;
    box.classList.add('nec-note');
    box.style.width = 'auto';
    var inner = box.querySelectorAll('[style]');
    for (var k = 0; k < inner.length; k++) {
      var s = inner[k].style;
      if (parseInt(s.borderLeftWidth, 10) >= 6) { s.borderLeftWidth = '3px'; s.borderLeftColor = ''; }
      if (parseInt(s.marginLeft, 10) >= 40) { s.marginLeft = '0'; }
      if (s.fontSize && s.fontSize.indexOf('%') > 0) {
        var fp = parseInt(s.fontSize, 10);
        if (fp > 100 && fp <= 145) s.fontSize = '';
      }
    }
  }
  var noteBoxes = document.querySelectorAll(
    '.mw-parser-output center > div[style*="border"], .mw-parser-output div[style*="80%"][style*="border"]'
  );
  for (var nb = 0; nb < noteBoxes.length; nb++) tameNoteBox(noteBoxes[nb]);

  // Necyklopedie has no .infobox class — its "infoboxes" are bare <table>s
  // floated right / aligned / pinned to a narrow px width via inline styles.
  // Detect those and fold them into a tappable "Stručná fakta" card (like the
  // Wikipedia app); give every other table a horizontal-scroll wrapper.
  function squish(s) { return (s || '').replace(/\\s+/g, ' ').trim(); }

  function isSidebarTable(tbl) {
    var st = (tbl.getAttribute('style') || '').toLowerCase().replace(/\\s+/g, '');
    var align = (tbl.getAttribute('align') || '').toLowerCase();
    if (st.indexOf('float:right') >= 0 || st.indexOf('float:left') >= 0) return true;
    if (align === 'right' || align === 'left') return true;
    var m = st.match(/width:(\\d+)px/);
    return !!(m && parseInt(m[1], 10) <= 340);
  }

  function summarize(tbl) {
    var cap = tbl.querySelector('caption');
    if (cap && squish(cap.textContent)) return squish(cap.textContent);
    var th = tbl.querySelector('th');
    if (th && squish(th.textContent)) return squish(th.textContent);
    return '';
  }

  function makeCard(tbl, sub) {
    var card = document.createElement('div');
    card.className = 'nec-collapsible';
    var bar = document.createElement('button');
    bar.type = 'button';
    bar.className = 'nec-collapsible-bar';
    var label = document.createElement('span');
    label.className = 'nec-collapsible-label';
    label.textContent = 'Stručná fakta';
    var subEl = document.createElement('span');
    subEl.className = 'nec-collapsible-sub';
    subEl.textContent = sub;
    var chev = document.createElement('span');
    chev.className = 'nec-collapsible-chevron';
    chev.textContent = '\\u25BE';
    bar.appendChild(label);
    bar.appendChild(subEl);
    bar.appendChild(chev);

    var body = document.createElement('div');
    body.className = 'nec-collapsible-body';
    body.style.display = 'none';

    tbl.parentNode.insertBefore(card, tbl);
    body.appendChild(tbl);
    card.appendChild(bar);
    card.appendChild(body);

    bar.addEventListener('click', function () {
      var open = card.classList.toggle('nec-open');
      body.style.display = open ? 'block' : 'none';
    });
  }

  function wrapScroll(tbl) {
    var scroll = document.createElement('div');
    scroll.className = 'nec-scroll';
    tbl.parentNode.insertBefore(scroll, tbl);
    scroll.appendChild(tbl);
  }

  // Promote the lead image of the first sidebar/infobox table to a full-bleed
  // hero above the title (like the Wikipedia app), and drop it from the table
  // so it isn't duplicated once the table collapses into its card.
  (function () {
    var content = document.getElementById('content');
    if (!content) return;
    var cand = document.querySelectorAll('.mw-parser-output table');
    var sidebar = null;
    for (var i = 0; i < cand.length; i++) {
      if (cand[i].parentElement && cand[i].parentElement.closest('table')) continue;
      if (isSidebarTable(cand[i])) { sidebar = cand[i]; break; }
    }
    if (!sidebar) return;
    var img = sidebar.querySelector('img');
    if (!img) return;
    var w = parseInt(img.getAttribute('width') || '0', 10);
    if (w && w < 120) return;
    var fig = document.createElement('figure');
    fig.className = 'nec-hero';
    var heroImg = document.createElement('img');
    // Use the original (full-size) file, not the ~254px infobox thumb, so the
    // full-bleed retina band isn't a blurry upscale.
    heroImg.src = fullImageUrl(img.currentSrc || img.src);
    var alt = img.getAttribute('alt');
    if (alt) heroImg.alt = alt;
    fig.appendChild(heroImg);
    content.insertBefore(fig, content.firstChild);
    var row = img.closest('tr');
    if (row && row.parentNode) row.parentNode.removeChild(row);
    else {
      var cell = img.closest('td, th');
      if (cell && cell.parentNode) cell.parentNode.removeChild(cell);
      else if (img.parentNode) img.parentNode.removeChild(img);
    }
  })();

  // Group runs of 2+ adjacent thumbnails into a swipeable horizontal gallery,
  // so the wiki's habit of dumping many images in a row doesn't become a tall
  // vertical stack. Isolated thumbnails are left inline.
  function meaningfulSibling(node, dir) {
    var n = dir > 0 ? node.nextSibling : node.previousSibling;
    while (n && n.nodeType === 3 && !/\\S/.test(n.textContent)) {
      n = dir > 0 ? n.nextSibling : n.previousSibling;
    }
    return n;
  }
  function isThumbNode(n) {
    return !!(n && n.nodeType === 1 && n.classList && n.classList.contains('thumb'));
  }
  var thumbEls = document.querySelectorAll('.thumb');
  for (var gi = 0; gi < thumbEls.length; gi++) {
    (function (thumb) {
      if (thumb.closest('.nec-gallery')) return;
      if (isThumbNode(meaningfulSibling(thumb, -1))) return; // only start at a run's head
      var run = [thumb];
      var cur = thumb;
      var nxt;
      while (isThumbNode((nxt = meaningfulSibling(cur, 1)))) { run.push(nxt); cur = nxt; }
      if (run.length < 2) return;
      var gallery = document.createElement('div');
      gallery.className = 'nec-gallery';
      thumb.parentNode.insertBefore(gallery, thumb);
      for (var r = 0; r < run.length; r++) gallery.appendChild(run[r]);
    })(thumbEls[gi]);
  }

  // Some amboxes are tables, not divs (featured badges, "Tento článek" notices).
  // Tame them like the div notes so they don't fall through to a scroll wrapper.
  // Tight selector (class or 80%+border) so real data tables keep their wrapper.
  var noteTables = document.querySelectorAll(
    '.mw-parser-output table.boilerplate, .mw-parser-output table.metadata, .mw-parser-output table[style*="80%"][style*="border"]'
  );
  for (var nt = 0; nt < noteTables.length; nt++) {
    var ntbl = noteTables[nt];
    if (isSidebarTable(ntbl)) continue;
    if (ntbl.parentElement && ntbl.parentElement.closest('table')) continue;
    tameNoteBox(ntbl);
  }

  var tables = document.querySelectorAll('.mw-parser-output table');
  for (var t = 0; t < tables.length; t++) {
    var tbl = tables[t];
    // Skip nested tables and anything already relocated/tamed this pass.
    if (tbl.closest('.nec-scroll') || tbl.closest('.nec-collapsible-body')) continue;
    if (tbl.classList.contains('nec-note')) continue;
    if (tbl.parentElement && tbl.parentElement.closest('table')) continue;
    if (isSidebarTable(tbl)) makeCard(tbl, summarize(tbl));
    else wrapScroll(tbl);
  }

  function refText(id) {
    var el = document.getElementById(id);
    if (!el) return '';
    return (el.textContent || '').replace(/\\s+/g, ' ').trim();
  }

  // Smooth-scroll to a section, offset by the floating-header zone so the
  // heading lands below it. Exposed so the native side (TOC, initial anchor)
  // can drive it too.
  function scrollToAnchor(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var pad = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--top-pad'), 10) || 0;
    var y = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0) - pad - 8;
    window.scrollTo({ top: y < 0 ? 0 : y, behavior: 'smooth' });
  }
  window.necScrollToAnchor = scrollToAnchor;

  document.addEventListener('click', function (e) {
    var el = e.target;
    if (!el || !el.closest) return;

    // Images: thumbnails are <a class="image"><img></a>; also catch bare <img>.
    var imageLink = el.closest('a.image');
    var imgEl = el.closest('img');
    if (imageLink || imgEl) {
      var img = imageLink ? imageLink.querySelector('img') : imgEl;
      if (img) {
        e.preventDefault();
        var raw = img.currentSrc || img.src;
        post('image', { src: fullImageUrl(raw), caption: img.getAttribute('alt') || '' });
        return;
      }
    }

    var a = el.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';

    // In-page anchors: citations open a sheet, other anchors scroll in place.
    if (href.charAt(0) === '#') {
      var id = decodeURIComponent(href.slice(1));
      if (a.closest('.reference') || id.indexOf('cite_note') === 0 || id.indexOf('cite_ref') === 0) {
        var t = refText(id);
        if (t) { e.preventDefault(); post('reference', { id: id, text: t }); return; }
      }
      if (document.getElementById(id)) { e.preventDefault(); scrollToAnchor(id); }
      return;
    }

    // Resolve to absolute (anchors resolve against the document baseUrl).
    var r = document.createElement('a');
    r.href = a.href;
    if (r.hostname === 'necyklopedie.org' || r.hostname === 'www.necyklopedie.org') {
      if (r.pathname.indexOf('/wiki/') === 0) {
        e.preventDefault();
        var title = decodeURIComponent(r.pathname.slice(6)).replace(/_/g, ' ');
        var anchor = r.hash ? decodeURIComponent(r.hash.slice(1)) : '';
        post('link', { title: title, anchor: anchor });
        return;
      }
    }

    // Anything else is external.
    e.preventDefault();
    post('external', { url: a.href });
  }, true);

  function ready() {
    // Report section anchors + their document offsets so the native TOC can
    // list them and highlight the one currently in view.
    var sections = [];
    var heads = document.querySelectorAll('.mw-headline');
    for (var s = 0; s < heads.length; s++) {
      var h = heads[s];
      if (!h.id) continue;
      var top = h.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
      sections.push({ anchor: h.id, top: Math.round(top) });
    }
    post('ready', { height: document.body ? document.body.scrollHeight : 0, sections: sections });
  }
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready);
})();
true;
`;
