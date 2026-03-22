import type { AuthSession } from "@farm-oss/auth";
import * as SecureStore from "expo-secure-store";

const SESSION_KEY = "farm_oss_session";

export async function getSession() {
  const value = await SecureStore.getItemAsync(SESSION_KEY);
  return value ? (JSON.parse(value) as AuthSession) : null;
}

export async function setSession(session: AuthSession) {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
