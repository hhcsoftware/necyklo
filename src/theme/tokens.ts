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
  dark: {
    background: "#101418",
    surface: "#1c1f24",
    surfaceAlt: "#27292d",
    text: "#f8f9fa",
    textMuted: "#a2a9b1",
    link: "#6699ff",
    border: "#3a3d42",
    tint: "#4aa3ff",
    danger: "#ff6b6b",
  },
};
