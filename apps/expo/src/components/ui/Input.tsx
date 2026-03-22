import { TextInput, type TextInputProps, View } from "react-native";
import type { ThemeColors } from "@/theme/colors";
import { radii, spacing } from "@/theme/spacing";
import { Text } from "./Text";

type Props = TextInputProps & {
  label?: string;
  theme?: ThemeColors;
};

/**
 * Themed text input with optional label.
 */
export function Input({ label, theme, style, multiline, ...rest }: Props) {
  return (
    <View style={{ gap: spacing[2] }}>
      {label && (
        <Text variant="label" color="textSecondary" theme={theme}>
          {label}
        </Text>
      )}
      <TextInput
        multiline={multiline}
        placeholderTextColor={theme?.textTertiary}
        style={[
          {
            backgroundColor: theme?.surface,
            borderColor: theme?.border,
            borderRadius: radii.lg,
            borderWidth: 1,
            color: theme?.text,
            fontSize: 16,
            minHeight: multiline ? 120 : 54,
            paddingHorizontal: spacing[4],
            paddingTop: multiline ? spacing[4] : 0,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}
