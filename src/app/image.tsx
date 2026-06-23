import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ImageViewer() {
  const { src, caption } = useLocalSearchParams<{ src: string; caption?: string }>();
  const insets = useSafeAreaInsets();

  return (
    <Pressable style={styles.backdrop} onPress={() => router.back()}>
      <Image
        source={src}
        style={styles.image}
        contentFit="contain"
        transition={150}
      />
      {caption ? (
        <Text
          style={[styles.caption, { bottom: insets.bottom + 24 }]}
          numberOfLines={4}
        >
          {caption}
        </Text>
      ) : null}
      <Pressable
        onPress={() => router.back()}
        hitSlop={16}
        style={[styles.close, { top: insets.top + 12 }]}
      >
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "80%" },
  caption: {
    position: "absolute",
    left: 20,
    right: 20,
    color: "#dddddd",
    fontSize: 13,
    textAlign: "center",
  },
  close: { position: "absolute", right: 18 },
  closeText: { color: "#ffffff", fontSize: 22, fontWeight: "600" },
});
