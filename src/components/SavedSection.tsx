import { Image } from "expo-image";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { SectionHeader } from "@/components/SectionHeader";
import { useSummary } from "@/hooks/useSummary";
import type { FavoriteEntry } from "@/storage/favorites";
import { useFavorites } from "@/storage/FavoritesProvider";
import { useTheme } from "@/theme/useTheme";

function SavedCard({ entry }: { entry: FavoriteEntry }) {
  const { colors } = useTheme();
  // Reuses the cached summary if the article also appears elsewhere in the feed.
  const { data } = useSummary(entry.title);
  const thumb = entry.thumbnail ?? data?.thumbnail;

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/article/[title]",
          params: { title: entry.title },
        })
      }
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      {thumb ? (
        <Image source={thumb} style={styles.thumb} contentFit="cover" transition={120} />
      ) : (
        <View style={[styles.thumb, { backgroundColor: colors.surfaceAlt }]} />
      )}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {entry.displayTitle}
      </Text>
    </Pressable>
  );
}

export function SavedSection() {
  const { favorites } = useFavorites();
  if (favorites.length === 0) return null;

  return (
    <View>
      <SectionHeader title="Oblíbené" />
      <FlatList
        horizontal
        data={favorites}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(f) => f.title}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <SavedCard entry={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, gap: 12 },
  card: {
    width: 150,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  thumb: { width: "100%", height: 88 },
  title: { fontSize: 14, fontWeight: "600", padding: 10 },
});
