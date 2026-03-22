import type { ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";
import { Text } from "./Text";

type Variant = "primary" | "outline" | "ghost";

type Props = Omit<PressableProps, "children"> & {
  children: ReactNode;
  variant?: Variant;
};

const baseClass = "items-center rounded-2xl justify-center min-h-[52px] px-4";

const variantClasses: Record<Variant, string> = {
  primary: "bg-light-accent dark:bg-dark-accent",
  outline: "border border-light-border-strong dark:border-dark-border-strong",
  ghost: "",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: Props) {
  const variantClass = variantClasses[variant];
  const textColorClass =
    variant === "primary"
      ? "text-light-accent-text dark:text-dark-accent-text"
      : "";

  return (
    <Pressable
      className={`${baseClass} ${variantClass} ${className}`.trim()}
      {...rest}
    >
      {typeof children === "string" ? (
        <Text variant="label" className={`text-base ${textColorClass}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
