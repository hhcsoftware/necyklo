import { useColorScheme } from "react-native";

import { type ColorScheme, type Palette, palettes } from "@/theme/tokens";

export interface Theme {
  scheme: ColorScheme;
  colors: Palette;
}

/**
 * Resolves the active theme from the OS color scheme. Re-renders whenever the
 * user toggles light/dark at the system level.
 */
export function useTheme(): Theme {
  const scheme: ColorScheme = useColorScheme() === "dark" ? "dark" : "light";
  return { scheme, colors: palettes[scheme] };
}
