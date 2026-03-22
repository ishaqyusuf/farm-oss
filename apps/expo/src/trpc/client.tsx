import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import superjson from "superjson";
import type { AppRouter } from "@api/trpc/routers/_app";
import { getBaseUrl } from "@/lib/base-url";
import { makeQueryClient } from "./query-client";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let mobileQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (!mobileQueryClient) {
    mobileQueryClient = makeQueryClient();
  }

  return mobileQueryClient;
}

export function TRPCReactProvider({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (options) =>
            process.env.NODE_ENV === "development" ||
            (options.direction === "down" && options.result instanceof Error)
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson
        })
      ]
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}

