import AsyncStorage from "@react-native-async-storage/async-storage";

/** A favorited article. We persist identifiers only; content is fetched live. */
export interface FavoriteEntry {
  /** Canonical title used as the route key (e.g. "Mobil"). */
  title: string;
  /** Human-facing title for display. */
  displayTitle: string;
  /** Optional thumbnail URL for the saved carousel. */
  thumbnail?: string;
  /** Epoch ms when saved; used for ordering (newest first). */
  savedAt: number;
}

const KEY = "necyklo:favorites:v1";

export async function loadFavorites(): Promise<FavoriteEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FavoriteEntry[]) : [];
  } catch {
    return [];
  }
}

export async function persistFavorites(list: FavoriteEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Best-effort; a failed write just means the toggle won't survive restart.
  }
}
