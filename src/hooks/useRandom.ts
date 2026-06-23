import { useQuery } from "@tanstack/react-query";

import { randomArticles } from "@/api/endpoints";

/** A fresh batch of random articles. Not cached so each shuffle differs. */
export function useRandom(count = 6) {
  return useQuery({
    queryKey: ["random", count],
    queryFn: ({ signal }) => randomArticles(count, signal),
    staleTime: 0,
    gcTime: 0,
  });
}
