import { Pressable, StyleSheet, Text } from "react-native";

import { stripHtml } from "@/lib/wiki";
import { useTheme } from "@/theme/useTheme";

interface Props {
  title: string;
  snippet?: string;
  onPress: () => void;
}

export function SearchResultRow({ title, snippet, onPress }: Props) {
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
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      {snippet ? (
        <Text style={[styles.snippet, { color: colors.textMuted }]} numberOfLines={2}>
          {stripHtml(snippet)}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 3,
  },
  title: { fontSize: 16, fontWeight: "600" },
  snippet: { fontSize: 13, lineHeight: 18 },
});
