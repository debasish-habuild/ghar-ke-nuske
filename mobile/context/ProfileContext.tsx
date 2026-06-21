/**
 * ProfileContext — the user's local profile and engagement stats.
 *
 * There is no login yet, so everything lives in AsyncStorage on the device and
 * defaults to a generic "User". When the profile-sync feature lands later, this
 * is the single place that would start reading/writing the backend instead.
 *
 * Stats tracked locally:
 *  - streak: consecutive days the app was opened (recordOpen() runs on launch)
 *  - used:   distinct remedies whose Detail page was opened (markUsed(id))
 *  - saved:  lives in SavedContext (already local)
 */
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_NAME = "profile_name";
const KEY_STREAK = "profile_streak";
const KEY_LAST_OPEN = "profile_last_open"; // YYYY-MM-DD
const KEY_USED = "profile_used"; // JSON array of remedy ids

const DEFAULT_NAME = "User";

// Local date as YYYY-MM-DD (device timezone), used to compare calendar days.
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

interface ProfileContextType {
  name: string;
  setName: (name: string) => void;
  streak: number;
  used: number;
  markUsed: (remedyId: string) => void;
}

const ProfileContext = createContext<ProfileContextType>({
  name: DEFAULT_NAME,
  setName: () => {},
  streak: 0,
  used: 0,
  markUsed: () => {},
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [name, setNameState] = useState(DEFAULT_NAME);
  const [streak, setStreak] = useState(0);
  const [usedSet, setUsedSet] = useState<Set<string>>(new Set());

  // Load persisted profile + recompute the streak from the last open date.
  useEffect(() => {
    (async () => {
      const [storedName, storedStreak, lastOpen, storedUsed] =
        await Promise.all([
          AsyncStorage.getItem(KEY_NAME),
          AsyncStorage.getItem(KEY_STREAK),
          AsyncStorage.getItem(KEY_LAST_OPEN),
          AsyncStorage.getItem(KEY_USED),
        ]);

      if (storedName) setNameState(storedName);
      if (storedUsed) setUsedSet(new Set(JSON.parse(storedUsed)));

      const today = new Date();
      const todayKey = dayKey(today);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayKey = dayKey(yesterday);

      let nextStreak = storedStreak ? parseInt(storedStreak, 10) : 0;
      if (lastOpen === todayKey) {
        // Already counted today — leave the streak as-is.
        nextStreak = nextStreak || 1;
      } else if (lastOpen === yesterdayKey) {
        nextStreak = nextStreak + 1; // consecutive day
      } else {
        nextStreak = 1; // first open or a gap broke the streak
      }

      setStreak(nextStreak);
      AsyncStorage.setItem(KEY_STREAK, String(nextStreak));
      AsyncStorage.setItem(KEY_LAST_OPEN, todayKey);
    })();
  }, []);

  const setName = (next: string) => {
    const value = next.trim() || DEFAULT_NAME;
    setNameState(value);
    AsyncStorage.setItem(KEY_NAME, value);
  };

  const markUsed = (remedyId: string) => {
    setUsedSet((prev) => {
      if (prev.has(remedyId)) return prev;
      const next = new Set(prev);
      next.add(remedyId);
      AsyncStorage.setItem(KEY_USED, JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <ProfileContext.Provider
      value={{ name, setName, streak, used: usedSet.size, markUsed }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
