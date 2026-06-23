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
 *   { type: 'ready',     payload: { height } }
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

  function refText(id) {
    var el = document.getElementById(id);
    if (!el) return '';
    return (el.textContent || '').replace(/\\s+/g, ' ').trim();
  }

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
      var target = document.getElementById(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
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

  function ready() { post('ready', { height: document.body ? document.body.scrollHeight : 0 }); }
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready);
})();
true;
`;
