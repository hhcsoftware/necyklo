import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { stripHtml } from "@/lib/wiki";
import { useTheme } from "@/theme/useTheme";

interface Props {
  title: string;
  snippet?: string;
  thumbnail?: string;
  onPress: () => void;
}

export function SearchResultRow({ title, snippet, thumbnail, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: colors.border,
          backgroundColor: pressed ? colors.surfaceAlt : "transparent",
        },
      ]}
    >
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {snippet ? (
          <Text style={[styles.snippet, { color: colors.textMuted }]} numberOfLines={2}>
            {stripHtml(snippet)}
          </Text>
        ) : null}
      </View>
      {thumbnail ? (
        <Image
          source={thumbnail}
          style={[styles.thumb, { backgroundColor: colors.surfaceAlt }]}
          contentFit="cover"
          transition={120}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  text: { flex: 1, gap: 3 },
  title: { fontSize: 16, fontWeight: "600" },
  snippet: { fontSize: 13, lineHeight: 18 },
  thumb: { width: 52, height: 52, borderRadius: 6 },
});
