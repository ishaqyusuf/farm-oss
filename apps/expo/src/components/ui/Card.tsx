import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

type ThemeVariant = "dark" | "light";

type Props = ViewProps & {
  theme?: ThemeVariant;
  variant?: "filled" | "subtle";
  children?: ReactNode;
};

const themeClasses: Record<ThemeVariant, Record<"filled" | "subtle", string>> = {
  dark: {
    filled: "bg-dark-surface border-dark-border",
    subtle: "bg-dark-surface-subtle border-dark-border",
  },
  light: {
    filled: "bg-light-surface border-light-border",
    subtle: "bg-light-surface-subtle border-light-border",
  },
};

export function Card({
  theme = "dark",
  variant = "filled",
  className = "",
  ...rest
}: Props) {
  const base = "rounded-3xl border gap-2.5 p-5";
  const themeClass = themeClasses[theme][variant];

  return (
    <View className={`${base} ${themeClass} ${className}`.trim()} {...rest} />
  );
}
