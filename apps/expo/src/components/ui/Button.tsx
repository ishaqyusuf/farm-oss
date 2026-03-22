import type { ReactNode } from "react";
import { Pressable, type PressableProps, type ViewStyle } from "react-native";
import type { ThemeColors } from "@/theme/colors";
import { radii, spacing } from "@/theme/spacing";
import { Text } from "./Text";

type Variant = "primary" | "outline" | "ghost";

type Props = Omit<PressableProps, "children"> & {
  children: ReactNode;
  variant?: Variant;
  theme?: ThemeColors;
};

/**
 * Themed button with three visual variants.
 *
 * - `primary`: accent background, accentText text
 * - `outline`: transparent with border, text colored
 * - `ghost`: transparent, text colored
 */
export function Button({
  children,
  variant = "primary",
  theme,
  style,
  ...rest
}: Props) {
  const base: ViewStyle = {
    alignItems: "center",
    borderRadius: radii.lg,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing[4],
  };

  const variants: Record<Variant, ViewStyle> = {
    primary: {
      backgroundColor: theme?.accent,
    },
    outline: {
      borderColor: theme?.borderStrong,
      borderWidth: 1,
    },
    ghost: {},
  };

  const textColor = variant === "primary" ? "accentText" : "text";

  return (
    <Pressable style={[base, variants[variant], style as ViewStyle]} {...rest}>
      {typeof children === "string" ? (
        <Text
          variant="label"
          color={textColor}
          theme={theme}
          style={{ fontSize: 16 }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
