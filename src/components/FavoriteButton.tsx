import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text } from "react-native";

import { useFavorites } from "@/storage/FavoritesProvider";
import { useTheme } from "@/theme/useTheme";

interface Props {
  title: string;
  displayTitle: string;
  thumbnail?: string;
}

export function FavoriteButton({ title, displayTitle, thumbnail }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const { colors } = useTheme();
  const active = isFavorite(title);
  // Neutral near-white when unsaved (like the Wikipedia app's header glyphs);
  // brand accent only once saved.
  const color = active ? colors.tint : colors.text;

  return (
    <Pressable
      onPress={() => toggle({ title, displayTitle, thumbnail })}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={active ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
    >
      <SymbolView
        name={active ? "star.fill" : "star"}
        tintColor={color}
        size={22}
        fallback={
          <Text style={[styles.fallback, { color }]}>{active ? "★" : "☆"}</Text>
        }
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({ fallback: { fontSize: 20 } });
