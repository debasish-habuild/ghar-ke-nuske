/**
 * ThemeContext — app-wide light/dark theming.
 *
 * Exposes the active `colors` palette, an `isDark` flag and a `toggle`. The
 * preference is persisted in AsyncStorage so it survives restarts. Screens read
 * `colors` and feed it into a `makeStyles(colors)` factory (see constants/theme).
 */
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Palette, lightColors, darkColors } from "../constants/theme";

const STORAGE_KEY = "theme_mode"; // "light" | "dark"

interface ThemeContextType {
  colors: Palette;
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: lightColors,
  isDark: false,
  toggle: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === "dark") setIsDark(true);
    });
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      return next;
    });
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
