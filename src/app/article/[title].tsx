import { Stack, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ArticleWebView } from "@/components/ArticleWebView";
import { ErrorView } from "@/components/ErrorView";
import { FloatingArticleHeader } from "@/components/FloatingArticleHeader";
import { Loading } from "@/components/Loading";
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

  // Hide the floating header on scroll-down, reveal on scroll-up / near the top.
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
          html={article.data.html}
          scheme={scheme}
          background={colors.background}
          titleHtml={article.data.displayTitle}
          topInset={insets.top}
          onScroll={handleScroll}
          initialAnchor={anchor}
        />
      )}
      <FloatingArticleHeader
        title={canonicalTitle}
        displayTitle={headerTitle}
        hidden={headerHidden}
      />
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 } });
