import type { ReactNode } from "react";
import { ScrollView, type ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = ScrollViewProps & {
  children?: ReactNode;
};

export function Screen({ children, className = "", ...rest }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <ScrollView
        contentContainerClassName={`gap-5 p-5 pb-9 ${className}`.trim()}
        {...rest}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
