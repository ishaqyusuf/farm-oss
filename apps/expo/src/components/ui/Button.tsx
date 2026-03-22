import type { ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";
import { Text } from "./Text";

type Variant = "primary" | "outline" | "ghost";
type ThemeVariant = "dark" | "light";

type Props = Omit<PressableProps, "children"> & {
  children: ReactNode;
  variant?: Variant;
  theme?: ThemeVariant;
};

const baseClass = "items-center rounded-2xl justify-center min-h-[52px] px-4";

const variantThemeClasses: Record<ThemeVariant, Record<Variant, string>> = {
  dark: {
    primary: "bg-dark-accent",
    outline: "border border-dark-border-strong",
    ghost: "",
  },
  light: {
    primary: "bg-light-accent",
    outline: "border border-light-border-strong",
    ghost: "",
  },
};

export function Button({
  children,
  variant = "primary",
  theme = "dark",
  className = "",
  ...rest
}: Props) {
  const variantClass = variantThemeClasses[theme][variant];

  return (
    <Pressable
      className={`${baseClass} ${variantClass} ${className}`.trim()}
      {...rest}
    >
      {typeof children === "string" ? (
        <Text
          variant="label"
          theme={theme}
          className={`text-base ${variant === "primary" ? (theme === "dark" ? "text-dark-accent-text" : "text-light-accent-text") : ""}`}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
