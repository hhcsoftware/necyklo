import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchResultRow } from "@/components/SearchResultRow";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearch } from "@/hooks/useSearch";
import { useTheme } from "@/theme/useTheme";

export default function SearchScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const query = useDebouncedValue(text.trim(), 280);
  const { data, isFetching } = useSearch(query);

  const showEmpty = query.length > 0 && !isFetching && (data?.length ?? 0) === 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 8 },
      ]}
    >
      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Hledat v Necyklopedii"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text }]}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {isFetching ? (
          <ActivityIndicator size="small" color={colors.textMuted} />
        ) : null}
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => String(item.pageid)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <SearchResultRow
            title={item.title}
            snippet={item.snippet}
            onPress={() =>
              router.push({
                pathname: "/article/[title]",
                params: { title: item.title },
              })
            }
          />
        )}
        ListEmptyComponent={
          showEmpty ? (
            <Text style={[styles.empty, { color: colors.textMuted }]}>
              Žádné výsledky pro „{query}“.
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, paddingVertical: 11, fontSize: 16 },
  empty: { textAlign: "center", marginTop: 40, fontSize: 14 },
});
