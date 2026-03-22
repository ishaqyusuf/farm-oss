import type { ReactNode } from "react";
import { Text as RNText, type TextProps } from "react-native";

type Variant =
  | "hero"
  | "heading"
  | "title"
  | "body"
  | "detail"
  | "label"
  | "caption"
  | "tag";

type Props = TextProps & {
  variant?: Variant;
  children?: ReactNode;
};

const variantClasses: Record<Variant, string> = {
  tag: "text-xs font-bold uppercase tracking-wider",
  hero: "text-[34px] font-extrabold leading-[38px] -tracking-wide",
  heading: "text-[28px] font-extrabold leading-8",
  title: "text-xl font-bold",
  body: "text-base leading-relaxed",
  detail: "text-[15px] leading-snug",
  label: "text-sm font-bold",
  caption: "text-[13px] leading-[18px]",
};

export function Text({ variant = "body", className = "", ...rest }: Props) {
  const base = variantClasses[variant];

  return (
    <RNText
      className={`${base} text-light-text dark:text-dark-text ${className}`.trim()}
      {...rest}
    />
  );
}
