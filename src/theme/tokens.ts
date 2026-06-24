export type ColorScheme = "light" | "dark";

export interface Palette {
  /** Screen background */
  background: string;
  /** Card / elevated surface */
  surface: string;
  /** Subtle alternate surface (wiki-style #f8f9fa) */
  surfaceAlt: string;
  /** Primary body text */
  text: string;
  /** Secondary / muted text */
  textMuted: string;
  /** Wiki link color */
  link: string;
  /** Hairline borders / dividers */
  border: string;
  /** Brand accent (Necyklopedie blue) */
  tint: string;
  /** Color for a destructive / "remove" action */
  danger: string;
}

export const palettes: Record<ColorScheme, Palette> = {
  light: {
    background: "#ffffff",
    surface: "#ffffff",
    surfaceAlt: "#f8f9fa",
    text: "#202122",
    textMuted: "#54595d",
    link: "#3366cc",
    border: "#eaecf0",
    tint: "#208aef",
    danger: "#d33",
  },
  // True-black AMOLED dark theme (matches the Wikipedia app), neutral grays
  // with no blue tint so it reads as black, not navy.
  dark: {
    background: "#000000",
    // Elevated tones must stay readable against pure black: surface lifts cards
    // off the background, surfaceAlt is one step up for pressed/elevated state.
    surface: "#1c1c1e",
    surfaceAlt: "#262629",
    text: "#f2f2f3",
    textMuted: "#9ba1a6",
    link: "#6699ff",
    border: "#2a2a2d",
    tint: "#4aa3ff",
    danger: "#ff6b6b",
  },
};
