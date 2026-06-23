import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";

import { getReference } from "@/lib/referenceStore";
import { useTheme } from "@/theme/useTheme";

export default function ReferenceSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const text = (id && getReference(id)) || "Poznámka není k dispozici.";

  return (
    <ScrollView
      style={{ backgroundColor: colors.surface }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.label, { color: colors.textMuted }]}>Poznámka</Text>
      <Text style={[styles.body, { color: colors.text }]}>{text}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  body: { fontSize: 16, lineHeight: 24 },
});
