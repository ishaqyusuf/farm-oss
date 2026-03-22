import { TextInput, type TextInputProps, View } from "react-native";
import { Text } from "./Text";

type ThemeVariant = "dark" | "light";

type Props = TextInputProps & {
  label?: string;
  theme?: ThemeVariant;
};

const themeInputClasses: Record<ThemeVariant, { input: string; placeholder: string }> = {
  dark: {
    input: "bg-dark-surface border-dark-border text-dark-text",
    placeholder: "rgba(247,240,222,0.76)",
  },
  light: {
    input: "bg-light-surface border-light-border text-light-text",
    placeholder: "#5d6558",
  },
};

export function Input({
  label,
  theme = "light",
  className = "",
  multiline,
  ...rest
}: Props) {
  const { input: inputClass, placeholder } = themeInputClasses[theme];
  const heightClass = multiline ? "min-h-[120px]" : "min-h-[54px]";
  const paddingClass = multiline ? "pt-4" : "";

  return (
    <View className="gap-2">
      {label && (
        <Text
          variant="label"
          theme={theme}
          className={theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}
        >
          {label}
        </Text>
      )}
      <TextInput
        multiline={multiline}
        placeholderTextColor={placeholder}
        className={`rounded-2xl border text-base px-4 ${heightClass} ${paddingClass} ${inputClass} ${className}`.trim()}
        {...rest}
      />
    </View>
  );
}
