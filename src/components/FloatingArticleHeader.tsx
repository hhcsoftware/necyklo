import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FavoriteButton } from "@/components/FavoriteButton";
import { GlassPill } from "@/components/GlassPill";
import { ShareButton } from "@/components/ShareButton";
import { useTheme } from "@/theme/useTheme";

interface Props {
  /** Canonical title — share + favorite key. */
  title: string;
  /** Display title stored with the favorite. */
  displayTitle: string;
  /** 0 = shown, 1 = hidden (slid up + faded); driven by article scroll. */
  hidden: SharedValue<number>;
}

/**
 * Wikipedia-style floating header: translucent Liquid Glass pills over the
 * article (back on the left, share + favorite on the right) instead of a solid
 * bar, so the content reads edge to edge and scrolls underneath.
 */
export function FloatingArticleHeader({ title, displayTitle, hidden }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - hidden.value,
    transform: [{ translateY: -hidden.value * (insets.top + 56) }],
  }));

  return (
    <Animated.View
      style={[styles.bar, { top: insets.top + 6 }, animatedStyle]}
      pointerEvents="box-none"
    >
      <GlassPill style={styles.backPill}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Zpět"
          style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.5 : 1 }]}
        >
          <SymbolView
            name="chevron.backward"
            tintColor={colors.text}
            size={20}
            fallback={<Text style={[styles.fallback, { color: colors.text }]}>‹</Text>}
          />
        </Pressable>
      </GlassPill>

      <GlassPill style={styles.actionsPill}>
        <ShareButton title={title} />
        <FavoriteButton title={title} displayTitle={displayTitle} />
      </GlassPill>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  backPill: { width: 44, height: 44, alignItems: "center" },
  actionsPill: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingHorizontal: 16,
  },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  fallback: { fontSize: 24, fontWeight: "600" },
});
