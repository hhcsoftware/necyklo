import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/theme/useTheme";

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
