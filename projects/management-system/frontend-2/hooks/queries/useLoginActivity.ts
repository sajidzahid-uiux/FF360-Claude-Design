import { useInfiniteQuery } from "@tanstack/react-query";

import { AuthService } from "@/api/services";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

const PAGE_SIZE = 20;

export const useLoginActivity = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.LOGIN_ACTIVITY],
    queryFn: async ({ pageParam = 1 }) => {
      return AuthService.getLoginActivity(pageParam, PAGE_SIZE);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.total_pages) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: CACHE_TIME.STALE,
  });
};
