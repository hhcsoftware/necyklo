import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { searchArticles } from "@/api/endpoints";

/** Full-text search results for a query. Keeps prior results visible while typing. */
export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: ({ signal }) => searchArticles(query, signal),
    enabled: query.trim().length > 0,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });
}
