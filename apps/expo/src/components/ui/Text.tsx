import type { ReactNode } from "react";
import { Text as RNText, type TextProps, type TextStyle } from "react-native";
import type { ThemeColors } from "@/theme/colors";
import { type TypographyVariant, typography } from "@/theme/typography";

type Props = TextProps & {
  variant?: TypographyVariant;
  color?: keyof ThemeColors;
  theme?: ThemeColors;
  children?: ReactNode;
};

/**
 * Themed `Text` component.
 *
 * Usage:
 * ```tsx
 * <Text variant="hero" theme={dark}>Hello</Text>
 * <Text variant="body" color="textSecondary" theme={light}>Detail</Text>
 * ```
 */
export function Text({
  variant = "body",
  color = "text",
  theme,
  style,
  ...rest
}: Props) {
  const variantStyle = typography[variant];
  const resolvedColor = theme?.[color];

  return (
    <RNText
      style={
        [
          variantStyle,
          resolvedColor ? { color: resolvedColor } : undefined,
          style,
        ] as TextStyle[]
      }
      {...rest}
    />
  );
}
