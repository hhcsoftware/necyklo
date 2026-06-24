import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { searchEverything } from "@/api/endpoints";

/** Combined prefix + full-text search. Keeps prior results visible while typing. */
export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: ({ signal }) => searchEverything(query, signal),
    enabled: query.trim().length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });
}
