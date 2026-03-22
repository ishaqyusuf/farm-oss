import { createContext, useContext } from "react";
import { useColorScheme } from "react-native";

type ThemeMode = "dark" | "light";

type ThemeContextValue = {
  theme: ThemeMode;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  isDark: true,
});

export function ThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const colorScheme = useColorScheme();
  const theme: ThemeMode = colorScheme === "light" ? "light" : "dark";

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
