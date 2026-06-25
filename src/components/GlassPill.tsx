import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { useTheme } from "@/theme/useTheme";

// iOS 26+ only; stable per device, so resolve once.
export const LIQUID_GLASS = isLiquidGlassAvailable();

/**
 * A translucent Liquid Glass capsule (back/action pills, the TOC button). Falls
 * back to a theme-aware translucent fill where Liquid Glass is unavailable.
 */
export function GlassPill({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { scheme, colors } = useTheme();
  if (LIQUID_GLASS) {
    return (
      <GlassView glassEffectStyle="regular" isInteractive style={[styles.pill, style]}>
        {children}
      </GlassView>
    );
  }
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor:
            scheme === "dark" ? "rgba(40,40,43,0.6)" : "rgba(255,255,255,0.72)",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { borderRadius: 22, overflow: "hidden", justifyContent: "center" },
});
