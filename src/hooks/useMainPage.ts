import { useQuery } from "@tanstack/react-query";

import { parseMainPage } from "@/api/endpoints";

/** Parsed "Hlavní strana", used to seed the Explore feed. */
export function useMainPage() {
  return useQuery({
    queryKey: ["mainpage"],
    queryFn: ({ signal }) => parseMainPage(signal),
    staleTime: 1000 * 60 * 10,
  });
}
