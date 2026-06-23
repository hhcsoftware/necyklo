import { QueryClient } from "@tanstack/react-query";

/**
 * Shared query client. Articles change rarely, so we keep data fresh for a few
 * minutes and cache aggressively to make recursive article navigation snappy.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
