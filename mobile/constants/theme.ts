/**
 * Theme palettes. The app supports light + dark modes (see context/ThemeContext).
 *
 * `Palette` lists every semantic colour token a screen may use. Both `lightColors`
 * and `darkColors` implement it, so screens never reference raw hexes — they build
 * their StyleSheet from the active palette via `makeStyles(colors)`.
 */

export interface Palette {
  primary: string;
  primaryDark: string;
  primaryLight: string; // tint used for badges / chips / soft backgrounds
  primaryLight2: string;
  bg: string; // screen background
  bgPage: string;
  bgCard: string; // accent card (e.g. Today's Recipe)
  card: string; // neutral surface — replaces the old hardcoded "#fff" cards
  subtle: string; // very soft row background (ingredient rows etc.)
  backBtn: string; // circular back-button background
  divider: string; // thin separators / hairline borders
  text: string;
  text2: string;
  text3: string;
  border: string;
  white: string; // always-white (text on coloured buttons, etc.)
  red: string;
  orange: string;
  orangeLight: string;
  shadow: string;
}

export const lightColors: Palette = {
  primary: "#13665A",
  primaryDark: "#0d4e44",
  primaryLight: "#e8f5f3",
  primaryLight2: "#c8e6e2",
  bg: "#FFFFFF",
  bgPage: "#F5F5F5",
  bgCard: "#F1F7FA",
  card: "#FFFFFF",
  subtle: "#f8faf9",
  backBtn: "#f5f5f5",
  divider: "#f0f0f0",
  text: "#292929",
  text2: "#474747",
  text3: "#666666",
  border: "#E7E7E7",
  white: "#FFFFFF",
  red: "#E53935",
  orange: "#E65100",
  orangeLight: "#FFF3E0",
  shadow: "#000000",
};

export const darkColors: Palette = {
  primary: "#2EA48F", // brighter green reads better on dark surfaces
  primaryDark: "#13665A",
  primaryLight: "#163029", // deep teal tint for badges/chips
  primaryLight2: "#1f4a42",
  bg: "#121212",
  bgPage: "#0d0d0d",
  bgCard: "#16302b",
  card: "#1e1e1e",
  subtle: "#1a1a1a",
  backBtn: "#2a2a2a",
  divider: "#2a2a2a",
  text: "#ECECEC",
  text2: "#C8C8C8",
  text3: "#9A9A9A",
  border: "#333333",
  white: "#FFFFFF",
  red: "#FF6B66",
  orange: "#FFA040",
  orangeLight: "#3a2a14",
  shadow: "#000000",
};

// Back-compat default export of the light palette for any code not yet themed.
export const Colors = lightColors;

export const Fonts = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};
