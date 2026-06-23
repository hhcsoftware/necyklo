import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useTheme } from "@/theme/useTheme";

export function Loading() {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
