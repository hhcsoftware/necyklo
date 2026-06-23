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
  const color = active ? colors.tint : colors.textMuted;

  return (
    <Pressable
      onPress={() => toggle({ title, displayTitle, thumbnail })}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={active ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
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
