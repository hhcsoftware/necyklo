import { useQuery } from "@tanstack/react-query";

import { parseArticle } from "@/api/endpoints";

export function useArticle(title: string) {
  return useQuery({
    queryKey: ["article", title],
    queryFn: ({ signal }) => parseArticle(title, signal),
    enabled: title.length > 0,
  });
}
