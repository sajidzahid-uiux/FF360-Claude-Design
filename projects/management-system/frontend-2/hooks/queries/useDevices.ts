import { useQuery } from "@tanstack/react-query";

import { AuthService } from "@/api/services";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

export const useDevices = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DEVICES],
    queryFn: () => AuthService.getDevices(),
    staleTime: CACHE_TIME.STALE,
  });
};
