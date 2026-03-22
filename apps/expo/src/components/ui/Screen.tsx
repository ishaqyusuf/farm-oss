import type { ReactNode } from "react";
import { ScrollView, type ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ThemeVariant = "dark" | "light";

type Props = ScrollViewProps & {
  theme?: ThemeVariant;
  children?: ReactNode;
};

const bgClasses: Record<ThemeVariant, string> = {
  dark: "bg-dark-bg",
  light: "bg-light-bg",
};

export function Screen({
  theme = "dark",
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <SafeAreaView className={`flex-1 ${bgClasses[theme]}`}>
      <ScrollView
        contentContainerClassName={`gap-5 p-5 pb-9 ${className}`.trim()}
        {...rest}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
