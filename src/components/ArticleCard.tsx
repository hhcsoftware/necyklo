import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useSummary } from "@/hooks/useSummary";
import { useTheme } from "@/theme/useTheme";

/** A feed row: title + lead extract, with a thumbnail when one exists. */
export function ArticleCard({ title }: { title: string }) {
  const { colors } = useTheme();
  const { data } = useSummary(title);

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/article/[title]", params: { title } })
      }
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: colors.border,
          backgroundColor: pressed ? colors.surfaceAlt : colors.surface,
        },
      ]}
    >
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {data?.title ?? title}
        </Text>
        {data?.extract ? (
          <Text
            style={[styles.extract, { color: colors.textMuted }]}
            numberOfLines={2}
          >
            {data.extract}
          </Text>
        ) : null}
      </View>
      {data?.thumbnail ? (
        <Image
          source={data.thumbnail}
          style={[styles.thumb, { backgroundColor: colors.surfaceAlt }]}
          contentFit="cover"
          transition={120}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginVertical: 5,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: { flex: 1, gap: 3 },
  title: { fontSize: 16, fontWeight: "600" },
  extract: { fontSize: 13, lineHeight: 18 },
  thumb: { width: 64, height: 64, borderRadius: 8 },
});
