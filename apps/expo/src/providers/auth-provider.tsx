import type { AuthSession } from "@farm-oss/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { clearSession, getSession, setSession } from "@/lib/session-store";
import { useTRPC } from "@/trpc/client";

type AuthContextValue = {
  isHydrated: boolean;
  session: AuthSession | null;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const trpc = useTRPC();
  const [isHydrated, setIsHydrated] = useState(false);
  const [session, setSessionState] = useState<AuthSession | null>(null);

  useEffect(() => {
    getSession()
      .then((storedSession) => {
        setSessionState(storedSession);
      })
      .finally(() => {
        setIsHydrated(true);
      });
  }, []);

  const value: AuthContextValue = {
    isHydrated,
    session,
    async signIn(input) {
      const nextSession = await trpc.auth.signIn.mutate(input);
      setSessionState(nextSession);
      await setSession(nextSession);
    },
    async signOut() {
      setSessionState(null);
      await clearSession();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
