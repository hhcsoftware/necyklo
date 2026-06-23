import { SymbolView } from "expo-symbols";
import { Pressable, Share, StyleSheet, Text } from "react-native";

import { articleUrl } from "@/lib/wiki";
import { useTheme } from "@/theme/useTheme";

interface Props {
  title: string;
}

export function ShareButton({ title }: Props) {
  const { colors } = useTheme();

  async function onShare() {
    try {
      // Share the link as a plain string. Passing it via the `url` field makes
      // iOS fail to copy it ("Cannot issue sandbox extension for URL"); as
      // `message` the Copy action copies the link and apps still preview it.
      await Share.share({ message: articleUrl(title) });
    } catch {
      // User dismissed the sheet or sharing failed; nothing to do.
    }
  }

  return (
    <Pressable
      onPress={onShare}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Sdílet článek"
    >
      <SymbolView
        name={{ ios: "square.and.arrow.up", android: "share", web: "share" }}
        tintColor={colors.tint}
        size={22}
        fallback={<Text style={[styles.fallback, { color: colors.tint }]}>↗</Text>}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({ fallback: { fontSize: 20 } });
