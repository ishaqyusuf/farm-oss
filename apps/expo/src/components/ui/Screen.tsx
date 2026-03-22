import type { ReactNode } from "react";
import { ScrollView, type ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ThemeColors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = ScrollViewProps & {
  theme?: ThemeColors;
  children?: ReactNode;
};

/**
 * Full-screen wrapper: SafeAreaView + ScrollView with themed background.
 */
export function Screen({
  theme,
  children,
  contentContainerStyle,
  ...rest
}: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme?.background }}>
      <ScrollView
        contentContainerStyle={[
          {
            gap: spacing[5],
            padding: spacing[5],
            paddingBottom: spacing[9],
          },
          contentContainerStyle,
        ]}
        {...rest}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
