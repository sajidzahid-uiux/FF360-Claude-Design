import { useQuery } from "@tanstack/react-query";

import { API_ENDPOINTS } from "@/api/endpoints";
import type { Conversation, MessagePreview } from "@/api/types";
import { API_URL } from "@/constants";
import { StorageKey } from "@/hooks/storage-data";
import { useRouteIds } from "@/hooks/useRouteIds";
import { getCookie } from "@/lib/cookies";
import { refetchIntervalWhenVisible } from "@/shared/lib";

const MESSAGES_PREVIEW_REFETCH_MS = 15 * 1000;

export const useLatestMessages = (groups: Conversation[]) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery({
    queryKey: ["latestMessages", groups.map((g) => g.id).join(",")],
    queryFn: async () => {
      if (!organizationId) return {};
      const results: Record<number, MessagePreview> = {};
      await Promise.all(
        groups.map(async (group) => {
          try {
            const res = await fetch(
              `${API_URL}${API_ENDPOINTS.chat.groupMessages(organizationId, group.id)}`,
              {
                headers: {
                  Authorization: `JWT ${getCookie(
                    StorageKey.ACCESS_TOKEN
                  )?.replace(/^JWT\s*/, "")}`,
                },
              }
            );
            const data = (await res.json()) as {
              results?: MessagePreview[];
            };
            if (Array.isArray(data.results) && data.results.length > 0) {
              // API returns newest first
              results[group.id] = data.results[0];
            }
          } catch {
            // ignore
          }
        })
      );
      return results;
    },
    enabled: !!organizationId && groups.length > 0,
    staleTime: 10 * 1000,
    refetchInterval: () =>
      refetchIntervalWhenVisible(MESSAGES_PREVIEW_REFETCH_MS),
  });
};
