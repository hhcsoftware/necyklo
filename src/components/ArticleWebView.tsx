import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { ARTICLE_BRIDGE } from "@/html/bridge";
import { buildArticleHtml } from "@/html/template";
import { setReference } from "@/lib/referenceStore";
import { WIKI_ORIGIN } from "@/lib/wiki";
import type { ColorScheme } from "@/theme/tokens";

export interface TocSection {
  anchor: string;
  /** Absolute document offset (px) of the section heading. */
  top: number;
}

export interface ArticleWebViewHandle {
  /** Scroll to a section anchor, offset for the floating header. */
  scrollToAnchor: (anchor: string) => void;
}

type BridgeMessage =
  | { type: "link"; payload: { title: string; anchor?: string } }
  | { type: "image"; payload: { src: string; caption?: string } }
  | { type: "reference"; payload: { id: string; text: string } }
  | { type: "external"; payload: { url: string } }
  | { type: "ready"; payload: { height: number; sections: TocSection[] } };

interface Props {
  html: string;
  scheme: ColorScheme;
  /** Screen background, applied to the WebView to avoid a load flash. */
  background: string;
  /** Rendered display title shown inline as the serif lead header. */
  titleHtml?: string;
  /** Top safe-area inset (px) so content clears the floating header. */
  topInset?: number;
  /** Reports the vertical scroll offset (px) for the hide-on-scroll header. */
  onScroll?: (offsetY: number) => void;
  /** Reports section anchors + offsets once ready (drives the TOC). */
  onSections?: (sections: TocSection[]) => void;
  /** Section anchor to scroll to once the page is ready. */
  initialAnchor?: string;
}

/** Runs the bridge's offset-aware scroll helper for a given anchor. */
function scrollJs(anchor: string): string {
  return `window.necScrollToAnchor&&window.necScrollToAnchor(${JSON.stringify(anchor)});true;`;
}

export const ArticleWebView = forwardRef<ArticleWebViewHandle, Props>(
  function ArticleWebView(
    {
      html,
      scheme,
      background,
      titleHtml,
      topInset,
      onScroll,
      onSections,
      initialAnchor,
    },
    ref,
  ) {
    const webRef = useRef<WebView>(null);

    useImperativeHandle(ref, () => ({
      scrollToAnchor: (anchor) => webRef.current?.injectJavaScript(scrollJs(anchor)),
    }));

    // Swap the theme in place (no reload) when the OS color scheme changes.
    useEffect(() => {
      webRef.current?.injectJavaScript(
        `document.documentElement.dataset.theme=${JSON.stringify(scheme)};true;`,
      );
    }, [scheme]);

    function handleMessage(event: WebViewMessageEvent) {
      let msg: BridgeMessage;
      try {
        msg = JSON.parse(event.nativeEvent.data) as BridgeMessage;
      } catch {
        return;
      }
      switch (msg.type) {
        case "link":
          router.push({
            pathname: "/article/[title]",
            params: { title: msg.payload.title, anchor: msg.payload.anchor ?? "" },
          });
          break;
        case "external":
          if (msg.payload.url) WebBrowser.openBrowserAsync(msg.payload.url).catch(() => {});
          break;
        case "image":
          router.push({
            pathname: "/image",
            params: { src: msg.payload.src, caption: msg.payload.caption ?? "" },
          });
          break;
        case "reference":
          setReference(msg.payload.id, msg.payload.text);
          router.push({ pathname: "/reference", params: { id: msg.payload.id } });
          break;
        case "ready":
          onSections?.(msg.payload.sections ?? []);
          if (initialAnchor) webRef.current?.injectJavaScript(scrollJs(initialAnchor));
          break;
      }
    }

    return (
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{
          html: buildArticleHtml(html, scheme, { titleHtml, topInset }),
          baseUrl: `${WIKI_ORIGIN}/`,
        }}
        injectedJavaScript={ARTICLE_BRIDGE}
        onMessage={handleMessage}
        onScroll={onScroll ? (e) => onScroll(e.nativeEvent.contentOffset.y) : undefined}
        onShouldStartLoadWithRequest={(req) =>
          // Allow only the initial in-memory document; real navigations are
          // intercepted by the bridge, so block everything else.
          req.url === `${WIKI_ORIGIN}/` ||
          req.url.startsWith("about:") ||
          req.url.startsWith("data:")
        }
        javaScriptCanOpenWindowsAutomatically={false}
        setSupportMultipleWindows={false}
        // Feel like a native screen, not a zoomable web page: no rubber-band
        // overscroll (iOS `bounces` / Android `overScrollMode`) and no pinch
        // zoom (also enforced via the viewport meta + a gesture blocker).
        bounces={false}
        overScrollMode="never"
        scalesPageToFit={false}
        // Fill under the status bar so the hero bleeds to the top and content
        // scrolls beneath the floating header (the body's top padding clears it).
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        style={[styles.web, { backgroundColor: background }]}
      />
    );
  },
);

const styles = StyleSheet.create({ web: { flex: 1 } });
