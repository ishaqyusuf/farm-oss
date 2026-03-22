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
type ThemeVariant = "dark" | "light";

type Props = TextProps & {
  variant?: Variant;
  theme?: ThemeVariant;
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

const themeTextClasses: Record<ThemeVariant, string> = {
  dark: "text-dark-text",
  light: "text-light-text",
};

export function Text({
  variant = "body",
  theme,
  className = "",
  ...rest
}: Props) {
  const base = variantClasses[variant];
  const themeClass = theme ? themeTextClasses[theme] : "";

  return (
    <RNText className={`${base} ${themeClass} ${className}`.trim()} {...rest} />
  );
}
