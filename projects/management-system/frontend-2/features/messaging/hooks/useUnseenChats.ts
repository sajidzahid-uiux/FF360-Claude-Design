import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useRouteIds } from "@/hooks/useRouteIds";
import axiosInstance from "@/lib/axios";
import {
  SHELL_BADGE_REFETCH_MS,
  refetchIntervalWhenVisible,
} from "@/shared/lib";

function useUnseenChats() {
  const { orgId: organization } = useRouteIds();
  const queryClient = useQueryClient();

  const unseenChatsQuery = useQuery({
    queryKey: ["unseenChats"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `chat/${organization}/unseen/count/`
      );
      return data;
    },
    enabled: !!organization,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: () => refetchIntervalWhenVisible(SHELL_BADGE_REFETCH_MS),
  });

  const unseenMessagesQuery = useQuery({
    queryKey: ["unseenMessages"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `chat/${organization}/unseen/messages/`
      );
      return data;
    },
    enabled: !!organization,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const seenMessagesMutation = useMutation({
    mutationFn: async ({ message_ids }: { message_ids: number[] }) => {
      const { data } = await axiosInstance.post(
        `chat/${organization}/seen/messages/`,
        { message_ids }
      );
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["unseenMessages"] });
      queryClient.invalidateQueries({ queryKey: ["unseenChats"] });
    },
  });

  return { ...unseenChatsQuery, unseenMessagesQuery, seenMessagesMutation };
}

export default useUnseenChats;
