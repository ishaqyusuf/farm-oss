import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { Button, Card, Input, Screen, Text } from "@/components/ui";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { isDark } = useTheme();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSignIn() {
    if (userId.length !== 6) {
      Alert.alert("Invalid ID", "Please enter your 6-digit user ID.");
      return;
    }
    if (password.length < 4) {
      Alert.alert(
        "Invalid password",
        "Password must be at least 4 characters.",
      );
      return;
    }

    setBusy(true);
    try {
      await signIn({ userId, password });
    } catch {
      Alert.alert("Sign in failed", "Please check your credentials.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDemo() {
    setBusy(true);
    try {
      await signIn({ userId: "100001", password: "demo1234" });
    } catch {
      Alert.alert("Error", "Could not connect to the server.");
    } finally {
      setBusy(false);
    }
  }

  const accentClass = "text-light-accent dark:text-dark-accent";
  const subtextClass = "text-light-text-tertiary dark:text-dark-text-tertiary";

  return (
    <Screen>
      <View className="flex-1 justify-center gap-6 py-10">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View className="items-center gap-2 mb-4">
          <Text variant="hero" className="text-center">
            🌱
          </Text>
          <Text variant="hero" className="text-center">
            Farm OSS
          </Text>
          <Text variant="detail" className={`text-center ${subtextClass}`}>
            Sign in with your 6-digit user ID
          </Text>
        </View>

        {/* ── Form ───────────────────────────────────────────────────── */}
        <Card className="gap-5">
          <Input
            label="User ID"
            placeholder="e.g. 100001"
            value={userId}
            onChangeText={(text) =>
              setUserId(text.replace(/\D/g, "").slice(0, 6))
            }
            keyboardType="number-pad"
            maxLength={6}
          />

          <Input
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button onPress={handleSignIn} disabled={busy}>
            {busy ? (
              <ActivityIndicator color={isDark ? "#18210f" : "#f6f1e6"} />
            ) : (
              "Sign in"
            )}
          </Button>
        </Card>

        {/* ── Demo shortcut ──────────────────────────────────────────── */}
        <Pressable onPress={handleDemo} disabled={busy}>
          <Text variant="caption" className={`text-center ${accentClass}`}>
            Try demo account →
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
