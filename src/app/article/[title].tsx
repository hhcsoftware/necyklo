import { Stack, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ArticleWebView,
  type ArticleWebViewHandle,
  type TocSection,
} from "@/components/ArticleWebView";
import { ErrorView } from "@/components/ErrorView";
import { FloatingArticleHeader } from "@/components/FloatingArticleHeader";
import { FloatingTocButton } from "@/components/FloatingTocButton";
import { Loading } from "@/components/Loading";
import { TableOfContents } from "@/components/TableOfContents";
import { useArticle } from "@/hooks/useArticle";
import { stripHtml } from "@/lib/wiki";
import { useTheme } from "@/theme/useTheme";

export default function ArticleScreen() {
  const params = useLocalSearchParams<{ title: string; anchor?: string }>();
  const title = params.title ?? "";
  const anchor = params.anchor || undefined;
  const insets = useSafeAreaInsets();
  const { scheme, colors } = useTheme();
  const article = useArticle(title);

  const headerTitle = article.data ? stripHtml(article.data.displayTitle) : title;
  const canonicalTitle = article.data?.title ?? title;
  const sections = article.data?.sections ?? [];

  const webRef = useRef<ArticleWebViewHandle>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState<string>();
  // Section offsets reported by the WebView; only read when opening the TOC.
  const sectionTops = useRef<TocSection[]>([]);

  // Hide the floating chrome on scroll-down, reveal on scroll-up / near the top.
  const headerHidden = useSharedValue(0);
  const lastY = useRef(0);
  const shown = useRef(true);
  function handleScroll(y: number) {
    const delta = y - lastY.current;
    lastY.current = y;
    if (y < 60) {
      if (!shown.current) {
        shown.current = true;
        headerHidden.value = withTiming(0, { duration: 180 });
      }
      return;
    }
    if (delta > 8 && shown.current) {
      shown.current = false;
      headerHidden.value = withTiming(1, { duration: 200 });
    } else if (delta < -8 && !shown.current) {
      shown.current = true;
      headerHidden.value = withTiming(0, { duration: 180 });
    }
  }

  function currentSection(): string | undefined {
    const tops = sectionTops.current;
    if (!tops.length) return undefined;
    const threshold = lastY.current + insets.top + 70;
    // Leave nothing highlighted while still in the lead (no heading crossed yet).
    let current: string | undefined;
    for (const s of tops) {
      if (s.top <= threshold) current = s.anchor;
      else break;
    }
    return current;
  }

  function openToc() {
    setActiveAnchor(currentSection());
    setTocOpen(true);
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* No solid bar: the content runs edge to edge under floating glass pills. */}
      <Stack.Screen options={{ headerShown: false }} />
      {article.isLoading ? (
        <Loading />
      ) : article.isError || !article.data ? (
        <ErrorView
          message="Článek se nepodařilo načíst."
          onRetry={() => article.refetch()}
        />
      ) : (
        <ArticleWebView
          ref={webRef}
          html={article.data.html}
          scheme={scheme}
          background={colors.background}
          titleHtml={article.data.displayTitle}
          topInset={insets.top}
          onScroll={handleScroll}
          onSections={(s) => {
            sectionTops.current = s;
          }}
          initialAnchor={anchor}
        />
      )}
      <FloatingArticleHeader
        title={canonicalTitle}
        displayTitle={headerTitle}
        hidden={headerHidden}
      />
      {sections.length > 0 ? (
        <>
          <FloatingTocButton onPress={openToc} hidden={headerHidden} />
          <TableOfContents
            visible={tocOpen}
            sections={sections}
            activeAnchor={activeAnchor}
            onClose={() => setTocOpen(false)}
            onSelect={(a) => {
              setTocOpen(false);
              webRef.current?.scrollToAnchor(a);
            }}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 } });
