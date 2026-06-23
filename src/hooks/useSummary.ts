import { useQuery } from "@tanstack/react-query";

import { getSummary } from "@/api/endpoints";

/** Lead extract + thumbnail for an article, used by feed cards. */
export function useSummary(title: string) {
  return useQuery({
    queryKey: ["summary", title],
    queryFn: ({ signal }) => getSummary(title, signal),
    enabled: title.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}
