import Constants from "expo-constants";

export function getBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const host = Constants.expoConfig?.hostUri?.split(":")[0];

  if (!host) {
    return "http://localhost:3001";
  }

  return `http://${host}:3001`;
}
