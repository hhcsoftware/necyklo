import { SymbolView } from "expo-symbols";
import { useCallback } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MAIN_PAGE_TITLE } from "@/api/endpoints";
import { ArticleCard } from "@/components/ArticleCard";
import { ErrorView } from "@/components/ErrorView";
import { Loading } from "@/components/Loading";
import { SavedSection } from "@/components/SavedSection";
import { SectionHeader } from "@/components/SectionHeader";
import { useMainPage } from "@/hooks/useMainPage";
import { useRandom } from "@/hooks/useRandom";
import { extractArticleLinks } from "@/lib/wiki";
import { useTheme } from "@/theme/useTheme";

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const mainPage = useMainPage();
  const random = useRandom(6);

  const featured = mainPage.data
    ? extractArticleLinks(mainPage.data.html, 8, [MAIN_PAGE_TITLE])
    : [];
  const refreshing = mainPage.isRefetching || random.isRefetching;
  const onRefresh = useCallback(() => {
    mainPage.refetch();
    random.refetch();
  }, [mainPage, random]);

  if (mainPage.isLoading && random.isLoading) return <Loading />;
  if (mainPage.isError && random.isError) return <ErrorView onRetry={onRefresh} />;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.tint}
        />
      }
    >
      <Text style={[styles.appTitle, { color: colors.text }]}>Necyklopedie</Text>

      <SavedSection />

      {featured.length > 0 ? <SectionHeader title="Z hlavní strany" /> : null}
      {featured.map((title) => (
        <ArticleCard key={title} title={title} />
      ))}

      <SectionHeader
        title="Náhodné články"
        action={
          <Pressable onPress={() => random.refetch()} hitSlop={10}>
            <SymbolView
              name="shuffle"
              tintColor={colors.tint}
              size={18}
              fallback={<Text style={{ color: colors.tint, fontSize: 16 }}>↻</Text>}
            />
          </Pressable>
        }
      />
      {(random.data ?? []).map((page) => (
        <ArticleCard key={page.id} title={page.title} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  appTitle: {
    fontSize: 30,
    fontWeight: "800",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
});
