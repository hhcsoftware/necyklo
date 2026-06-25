import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassPill } from "@/components/GlassPill";
import { useTheme } from "@/theme/useTheme";

interface Props {
  onPress: () => void;
  /** 0 = shown, 1 = hidden (slid down + faded); shares the header's scroll state. */
  hidden: SharedValue<number>;
}

const SIZE = 52;

/** Floating bottom-left glass button that opens the table of contents. */
export function FloatingTocButton({ onPress, hidden }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - hidden.value,
    transform: [{ translateY: hidden.value * (insets.bottom + 80) }],
  }));

  return (
    <Animated.View
      style={[styles.wrap, { bottom: insets.bottom + 16 }, animatedStyle]}
      pointerEvents="box-none"
    >
      <GlassPill style={styles.pill}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="Obsah"
          style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.5 : 1 }]}
        >
          <SymbolView
            name="list.bullet"
            tintColor={colors.text}
            size={22}
            fallback={<Text style={[styles.fallback, { color: colors.text }]}>☰</Text>}
          />
        </Pressable>
      </GlassPill>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, zIndex: 10 },
  pill: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, alignItems: "center" },
  btn: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
  fallback: { fontSize: 22, fontWeight: "600" },
});
