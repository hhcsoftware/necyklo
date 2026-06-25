import { SymbolView } from "expo-symbols";
import { useEffect, useRef } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { ArticleSection } from "@/api/types";
import { GlassPill } from "@/components/GlassPill";
import { stripHtml } from "@/lib/wiki";
import { useTheme } from "@/theme/useTheme";

interface Props {
  visible: boolean;
  sections: ArticleSection[];
  /** Anchor of the section currently in view, highlighted in the list. */
  activeAnchor?: string;
  onClose: () => void;
  onSelect: (anchor: string) => void;
}

/**
 * Wikipedia-style "OBSAH" drawer: slides in from the left over a dimmed
 * backdrop, listing the article's sections (serif for top level, indented sans
 * for deeper) with the in-view section highlighted. Tapping one jumps to it.
 */
export function TableOfContents({
  visible,
  sections,
  activeAnchor,
  onClose,
  onSelect,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.86, 380);

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, { duration: 220 });
  }, [visible, progress]);

  // Scroll the highlighted row into view when the drawer opens (long lists).
  const scrollRef = useRef<ScrollView>(null);
  const rowY = useRef<Record<string, number>>({});
  useEffect(() => {
    if (!visible || !activeAnchor) return;
    const y = rowY.current[activeAnchor];
    if (y == null) return;
    const frame = requestAnimationFrame(() =>
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 120), animated: false }),
    );
    return () => cancelAnimationFrame(frame);
  }, [visible, activeAnchor]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (progress.value - 1) * drawerWidth }],
  }));

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.root]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Zavřít obsah"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            backgroundColor: colors.background,
            borderRightColor: colors.border,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
          },
          drawerStyle,
        ]}
      >
        <Text style={[styles.kicker, { color: colors.textMuted }]}>OBSAH</Text>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((s) => {
            // toclevel is MediaWiki's normalized TOC depth (1 = top level);
            // raw heading `level` mis-nests articles that skip heading levels.
            const depth = Number(s.toclevel) || 1;
            const major = depth <= 1;
            const active = !!activeAnchor && s.anchor === activeAnchor;
            const label = stripHtml(s.line);
            return (
              <Pressable
                key={`${s.anchor}-${s.index}`}
                onPress={() => onSelect(s.anchor)}
                onLayout={(e) => {
                  rowY.current[s.anchor] = e.nativeEvent.layout.y;
                }}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [
                  styles.row,
                  { paddingLeft: (depth - 1) * 16, opacity: pressed ? 0.5 : 1 },
                ]}
              >
                <View style={styles.dotSlot}>
                  {active ? (
                    <View style={[styles.dot, { backgroundColor: colors.link }]} />
                  ) : null}
                </View>
                <Text
                  style={[
                    major ? styles.major : styles.minor,
                    { color: active ? colors.link : colors.text },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      <Animated.View
        style={[
          styles.closeWrap,
          { top: insets.top + 8, right: width - drawerWidth + 12 },
          backdropStyle,
        ]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <GlassPill style={styles.closePill}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Zavřít"
            style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.5 : 1 }]}
          >
            <SymbolView
              name="xmark"
              tintColor={colors.text}
              size={18}
              fallback={<Text style={{ color: colors.text, fontSize: 20 }}>✕</Text>}
            />
          </Pressable>
        </GlassPill>
      </Animated.View>
    </View>
  );
}

const CLOSE = 44;
const styles = StyleSheet.create({
  // Above the floating header/TOC button (zIndex 10) so it covers them when open.
  root: { zIndex: 20 },
  backdrop: { backgroundColor: "rgba(0,0,0,0.55)" },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 22,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },
  list: { paddingBottom: 24 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 9, minHeight: 44 },
  dotSlot: { width: 16, alignItems: "flex-start" },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  major: { fontFamily: "Georgia", fontSize: 19, lineHeight: 24, flex: 1 },
  minor: { fontSize: 15, lineHeight: 20, flex: 1 },
  closeWrap: { position: "absolute", zIndex: 2 },
  closePill: { width: CLOSE, height: CLOSE, borderRadius: CLOSE / 2, alignItems: "center" },
  closeBtn: { width: CLOSE, height: CLOSE, alignItems: "center", justifyContent: "center" },
});
