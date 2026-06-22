import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ChatGroup } from "@/api/types";
import { useRouteIds } from "@/hooks/useRouteIds";
import axiosInstance from "@/lib/axios";

function useChatGroups() {
  const queryClient = useQueryClient();
  const { orgId: organization } = useRouteIds();

  const chatGroupQuery = useQuery<ChatGroup[]>({
    queryKey: ["chatGroups"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ChatGroup[]>(
        `chat/${organization}/chatgroups/`
      );
      return data;
    },
    enabled: !!organization,
  });

  const getChatGroup = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data } = await axiosInstance.get<ChatGroup>(
        `chat/${organization}/chatgroups/${id}/`
      );
      return data;
    },
  });

  const addChatGroup = useMutation({
    mutationFn: async (newGroup: {
      group_name: string;
      group_description: string;
      group_image: File | null;
      is_private: boolean;
      members: number[];
    }) => {
      const formData = new FormData();
      formData.append("group_name", newGroup.group_name);
      formData.append("group_description", newGroup.group_description);
      if (newGroup.is_private)
        formData.append("is_private", newGroup.is_private + "");
      if (newGroup.group_image) {
        formData.append("group_image", newGroup.group_image);
      }
      newGroup.members.forEach((memberId) =>
        formData.append("members", memberId.toString())
      );
      const { data } = await axiosInstance.post<ChatGroup>(
        `chat/${organization}/chatgroups/`,
        formData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatGroups"] });
    },
  });

  const updateChatGroup = useMutation({
    mutationFn: async ({
      id,
      updatedGroup,
    }: {
      id: string;
      updatedGroup: {
        group_name: string;
        group_description: string;
        group_image: File | null;
        members: number[];
      };
    }) => {
      const formData = new FormData();
      formData.append("group_name", updatedGroup.group_name);
      formData.append("group_description", updatedGroup.group_description);
      if (updatedGroup.group_image) {
        formData.append("group_image", updatedGroup.group_image);
      }
      updatedGroup.members.forEach((memberId) =>
        formData.append("members", memberId.toString())
      );
      const { data } = await axiosInstance.put<ChatGroup>(
        `chat/${organization}/chatgroups/${id}/`,
        formData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatGroups"] });
    },
  });

  const deleteChatGroup = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`chat/${organization}/chatgroups/${id}/`);
      queryClient.invalidateQueries({ queryKey: ["chatGroups"] });
    },
  });

  return {
    ...chatGroupQuery,
    getChatGroup,
    addChatGroup,
    updateChatGroup,
    deleteChatGroup,
  };
}

export default useChatGroups;
