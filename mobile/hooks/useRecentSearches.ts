import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "recent_searches";
const MAX = 8;

/**
 * Persisted recent-search history (most-recent first, deduped, capped at MAX).
 * Backed by AsyncStorage so it survives app restarts.
 */
export function useRecentSearches() {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v) setRecents(JSON.parse(v));
    });
  }, []);

  const addRecent = useCallback((raw: string) => {
    const term = raw.trim();
    if (!term) return;
    setRecents((prev) => {
      const next = [
        term,
        ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase()),
      ].slice(0, MAX);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeRecent = useCallback((term: string) => {
    setRecents((prev) => {
      const next = prev.filter((t) => t !== term);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
    AsyncStorage.removeItem(KEY);
  }, []);

  return { recents, addRecent, removeRecent, clearRecents };
}
