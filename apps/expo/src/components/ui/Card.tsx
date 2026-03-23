import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

type Props = ViewProps & {
  variant?: "filled" | "subtle";
  children?: ReactNode;
};

const variantClasses: Record<"filled" | "subtle", string> = {
  filled:
    "bg-light-surface border-light-border dark:bg-dark-surface dark:border-dark-border",
  subtle:
    "bg-light-surface-subtle border-light-border dark:bg-dark-surface-subtle dark:border-dark-border",
};

export function Card({ variant = "filled", className = "", ...rest }: Props) {
  const base = "rounded-3xl border gap-2.5 p-5";

  return (
    <View
      className={`${base} ${variantClasses[variant]} ${className}`.trim()}
      {...rest}
    />
  );
}
