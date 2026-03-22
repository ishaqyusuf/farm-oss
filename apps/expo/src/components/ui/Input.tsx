import {
  TextInput,
  type TextInputProps,
  useColorScheme,
  View,
} from "react-native";
import { Text } from "./Text";

type Props = TextInputProps & {
  label?: string;
};

const inputClass =
  "bg-light-surface border-light-border text-light-text dark:bg-dark-surface dark:border-dark-border dark:text-dark-text";

export function Input({ label, className = "", multiline, ...rest }: Props) {
  const colorScheme = useColorScheme();
  const placeholder =
    colorScheme === "dark" ? "rgba(247,240,222,0.76)" : "#5d6558";
  const heightClass = multiline ? "min-h-[120px]" : "min-h-[54px]";
  const paddingClass = multiline ? "pt-4" : "";

  return (
    <View className="gap-2">
      {label && (
        <Text
          variant="label"
          className="text-light-text-secondary dark:text-dark-text-secondary"
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
