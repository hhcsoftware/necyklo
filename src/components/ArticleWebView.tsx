import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { ARTICLE_BRIDGE } from "@/html/bridge";
import { buildArticleHtml } from "@/html/template";
import { setReference } from "@/lib/referenceStore";
import { WIKI_ORIGIN } from "@/lib/wiki";
import type { ColorScheme } from "@/theme/tokens";

interface BridgeMessage {
  type: "link" | "image" | "reference" | "external" | "ready";
  payload: Record<string, string>;
}

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
  /** Section anchor to scroll to once the page is ready. */
  initialAnchor?: string;
}

export function ArticleWebView({
  html,
  scheme,
  background,
  titleHtml,
  topInset,
  onScroll,
  initialAnchor,
}: Props) {
  const ref = useRef<WebView>(null);

  // Swap the theme in place (no reload) when the OS color scheme changes.
  useEffect(() => {
    ref.current?.injectJavaScript(
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
    const p = msg.payload;
    switch (msg.type) {
      case "link":
        router.push({
          pathname: "/article/[title]",
          params: { title: p.title, anchor: p.anchor ?? "" },
        });
        break;
      case "external":
        if (p.url) WebBrowser.openBrowserAsync(p.url).catch(() => {});
        break;
      case "image":
        router.push({
          pathname: "/image",
          params: { src: p.src, caption: p.caption ?? "" },
        });
        break;
      case "reference":
        setReference(p.id, p.text);
        router.push({ pathname: "/reference", params: { id: p.id } });
        break;
      case "ready":
        if (initialAnchor) {
          ref.current?.injectJavaScript(
            `document.getElementById(${JSON.stringify(initialAnchor)})?.scrollIntoView();true;`,
          );
        }
        break;
    }
  }

  return (
    <WebView
      ref={ref}
      originWhitelist={["*"]}
      source={{
        html: buildArticleHtml(html, scheme, { titleHtml, topInset }),
        baseUrl: `${WIKI_ORIGIN}/`,
      }}
      injectedJavaScript={ARTICLE_BRIDGE}
      onMessage={handleMessage}
      onScroll={
        onScroll
          ? (e) => onScroll(e.nativeEvent.contentOffset.y)
          : undefined
      }
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
}

const styles = StyleSheet.create({ web: { flex: 1 } });
