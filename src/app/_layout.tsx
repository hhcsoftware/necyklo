import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "@/lib/queryClient";
import { FavoritesProvider } from "@/storage/FavoritesProvider";
import { useTheme } from "@/theme/useTheme";

export default function RootLayout() {
  const { colors } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <FavoritesProvider>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                headerTitleStyle: { color: colors.text },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="article/[title]"
                options={{ headerShown: true }}
              />
              <Stack.Screen
                name="image"
                options={{
                  presentation: "transparentModal",
                  animation: "fade",
                }}
              />
              <Stack.Screen
                name="reference"
                options={{
                  presentation: "formSheet",
                  sheetAllowedDetents: [0.4, 0.9],
                  sheetGrabberVisible: true,
                }}
              />
            </Stack>
          </FavoritesProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
