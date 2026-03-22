/**
 * Farm OSS mobile color tokens.
 *
 * Two palettes — dark (home/dashboard) and light (record entry).
 * Raw hex values live here; components reference them through the
 * `theme` object so a future dark/light toggle is a single change.
 */

export const palette = {
  // ── Greens ──────────────────────────────────────────────────────────
  green900: "#0b130d",
  green800: "#102015",
  green700: "#17301f",
  green600: "#1c2415",
  green500: "#2b3324",
  green400: "#2f6b3b",
  green300: "#5d6558",

  // ── Golds ───────────────────────────────────────────────────────────
  gold500: "#e9b949",
  gold400: "#eeb040",
  gold300: "#f0b429",

  // ── Creams ──────────────────────────────────────────────────────────
  cream100: "#f7f0de",
  cream200: "#f6f1e6",
  cream300: "#f8f4eb",
  cream400: "#fffdf7",

  // ── Neutrals ────────────────────────────────────────────────────────
  white: "#ffffff",
  black: "#000000",

  // ── Borders / overlays ──────────────────────────────────────────────
  whiteAlpha08: "rgba(255,255,255,0.08)",
  whiteAlpha12: "rgba(255,255,255,0.12)",
  whiteAlpha04: "rgba(255,255,255,0.04)",
  creamAlpha82: "rgba(247,240,222,0.82)",
  creamAlpha76: "rgba(247,240,222,0.76)",
  brownBorder: "#ded5c3",
  grayBorder: "#d7cfbe",
} as const;

/** Dark theme – used on dashboard / home screens. */
export const dark = {
  background: palette.green800,
  surface: palette.green700,
  surfaceSubtle: palette.whiteAlpha04,
  text: palette.cream100,
  textSecondary: palette.creamAlpha82,
  textTertiary: palette.creamAlpha76,
  accent: palette.gold500,
  accentText: "#18210f",
  border: palette.whiteAlpha08,
  borderStrong: palette.whiteAlpha12,
} as const;

/** Light theme – used on data-entry / record screens. */
export const light = {
  background: palette.cream200,
  surface: palette.white,
  surfaceSubtle: palette.cream400,
  text: palette.green600,
  textSecondary: palette.green500,
  textTertiary: palette.green300,
  accent: palette.green400,
  accentText: palette.cream200,
  border: palette.brownBorder,
  borderStrong: palette.grayBorder,
} as const;

export type ThemeColors = typeof dark;
