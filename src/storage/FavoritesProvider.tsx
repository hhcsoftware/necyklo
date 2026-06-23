import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  type FavoriteEntry,
  loadFavorites,
  persistFavorites,
} from "@/storage/favorites";

interface FavoritesContextValue {
  /** Saved articles, newest first. */
  favorites: FavoriteEntry[];
  /** Whether the initial hydration from storage has finished. */
  ready: boolean;
  isFavorite: (title: string) => boolean;
  /** Adds the entry if missing, removes it if present. */
  toggle: (entry: Omit<FavoriteEntry, "savedAt">) => void;
  remove: (title: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadFavorites().then((list) => {
      if (active) {
        setFavorites(list);
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist whenever the list changes, but not before hydration completes
  // (otherwise the empty initial state would clobber stored favorites).
  useEffect(() => {
    if (ready) persistFavorites(favorites);
  }, [favorites, ready]);

  const value = useMemo<FavoritesContextValue>(() => {
    const isFavorite = (title: string) =>
      favorites.some((f) => f.title === title);

    return {
      favorites,
      ready,
      isFavorite,
      remove: (title) =>
        setFavorites((prev) => prev.filter((f) => f.title !== title)),
      toggle: (entry) =>
        setFavorites((prev) => {
          if (prev.some((f) => f.title === entry.title)) {
            return prev.filter((f) => f.title !== entry.title);
          }
          return [{ ...entry, savedAt: Date.now() }, ...prev];
        }),
    };
  }, [favorites, ready]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return ctx;
}
