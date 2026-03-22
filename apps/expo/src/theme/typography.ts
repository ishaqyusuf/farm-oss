import type { TextStyle } from "react-native";

/**
 * Typography presets for consistent text rendering across the mobile app.
 * Each preset defines fontSize, fontWeight, lineHeight, and letterSpacing.
 */
export const typography = {
  /** Section tag — uppercase, small, bold */
  tag: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  } as TextStyle,

  /** Hero / page heading */
  hero: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 38,
  } as TextStyle,

  /** Section heading */
  heading: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
  } as TextStyle,

  /** Card title */
  title: {
    fontSize: 20,
    fontWeight: "700",
  } as TextStyle,

  /** Body text */
  body: {
    fontSize: 16,
    lineHeight: 25,
  } as TextStyle,

  /** Supporting detail text */
  detail: {
    fontSize: 15,
    lineHeight: 23,
  } as TextStyle,

  /** Form label */
  label: {
    fontSize: 14,
    fontWeight: "700",
  } as TextStyle,

  /** Small caption */
  caption: {
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,
} as const;

export type TypographyVariant = keyof typeof typography;
