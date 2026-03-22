import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import type { ThemeColors } from "@/theme/colors";
import { radii, spacing } from "@/theme/spacing";

type Props = ViewProps & {
  theme?: ThemeColors;
  variant?: "filled" | "subtle";
  children?: ReactNode;
};

/**
 * Themed card container with consistent border radius, padding, and colors.
 *
 * - `filled` (default): uses `surface` background
 * - `subtle`: uses `surfaceSubtle` background
 */
export function Card({ theme, variant = "filled", style, ...rest }: Props) {
  const bg = variant === "filled" ? theme?.surface : theme?.surfaceSubtle;

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderColor: theme?.border,
          borderRadius: radii["2xl"],
          borderWidth: 1,
          gap: spacing[2.5],
          padding: spacing[5],
        },
        style,
      ]}
      {...rest}
    />
  );
}
