import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/theme/useTheme";

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorView({ message, onRetry }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Text style={[styles.message, { color: colors.textMuted }]}>
        {message ?? "Něco se pokazilo."}
      </Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={[styles.button, { borderColor: colors.tint }]}
        >
          <Text style={[styles.buttonText, { color: colors.tint }]}>
            Zkusit znovu
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  message: { fontSize: 15, textAlign: "center" },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: { fontSize: 15, fontWeight: "600" },
});
