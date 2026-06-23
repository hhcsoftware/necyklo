import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import { ArticleWebView } from "@/components/ArticleWebView";
import { ErrorView } from "@/components/ErrorView";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Loading } from "@/components/Loading";
import { ShareButton } from "@/components/ShareButton";
import { useArticle } from "@/hooks/useArticle";
import { stripHtml } from "@/lib/wiki";
import { useTheme } from "@/theme/useTheme";

export default function ArticleScreen() {
  const params = useLocalSearchParams<{ title: string; anchor?: string }>();
  const title = params.title ?? "";
  const anchor = params.anchor || undefined;
  const { scheme, colors } = useTheme();
  const article = useArticle(title);

  const headerTitle = article.data ? stripHtml(article.data.displayTitle) : title;
  const canonicalTitle = article.data?.title ?? title;

  return (
    <>
      <Stack.Screen
        options={{
          title: headerTitle,
          headerBackButtonDisplayMode: "minimal",
          headerRight: () => (
            <View style={styles.headerActions}>
              <ShareButton title={canonicalTitle} />
              <FavoriteButton title={canonicalTitle} displayTitle={headerTitle} />
            </View>
          ),
        }}
      />
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
          initialAnchor={anchor}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: "row", alignItems: "center", gap: 18 },
});
