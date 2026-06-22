import { useMemo } from "react";

import useUnseenChats from "@/features/messaging/hooks/useUnseenChats";

interface UnseenChatsResponse {
  unseen_counts?: Record<string, number>;
}

export function useUnseenChatTotal(): number {
  const { data: unseenChats } = useUnseenChats();

  return useMemo(() => {
    const counts = (unseenChats as UnseenChatsResponse | undefined)
      ?.unseen_counts;
    if (!counts) return 0;
    return Object.values(counts).reduce(
      (total, count) => total + Number(count),
      0
    );
  }, [unseenChats]);
}
