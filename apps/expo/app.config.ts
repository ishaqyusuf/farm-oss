import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Farm OSS",
  slug: "farm-oss",
  version: "0.1.0",
  orientation: "portrait",
  scheme: "farmoss",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.farmoss.mobile"
  },
  android: {
    edgeToEdgeEnabled: true,
    package: "com.farmoss.mobile"
  },
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
    reactCompiler: true
  },
  extra: {
    router: {}
  }
};

export default config;

