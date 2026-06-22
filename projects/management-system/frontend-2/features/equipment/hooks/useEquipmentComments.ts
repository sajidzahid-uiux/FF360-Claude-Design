import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { invalidateEquipmentActivityLogs } from "@/hooks/queries/invalidateActivityLogs";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { useMapping } from "@/hooks/useMapping";
import { useRouteIds } from "@/hooks/useRouteIds";
import axiosInstance from "@/lib/axios";

interface Comment {
  id: number;
  text: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  mentioned_members?: number[];
}

interface PostCommentPayload {
  text: string;
  mentionIds?: number[];
}

interface PatchCommentProps {
  text: string;
  comment_id: number;
  mentionIds?: number[];
}

interface DeleteCommentProps {
  comment_id: number;
}

export const useEquipmentComments = (
  equipmentId: string | number | undefined
) => {
  const queryClient = useQueryClient();
  const { orgId: organization } = useRouteIds();
  const token = useDataFromStorageByKey(StorageKey.ACCESS_TOKEN);
  const { data: contentTypes } = useMapping("content_types");

  const getContentTypeId = () => {
    const contentTypeId = contentTypes?.find(
      (type: { id: number; model: string }) => type.model === "equipment"
    )?.id;

    if (!contentTypeId) {
      throw new Error("Content type for 'equipment' not found");
    }

    return contentTypeId;
  };

  const commentsQuery = useQuery<Comment[]>({
    queryKey: ["equipmentComments", equipmentId],
    enabled: !!organization && !!token && !!equipmentId && !!contentTypes,
    queryFn: async () => {
      if (!organization || !token) {
        throw new Error("Missing required authentication or organization data");
      }

      const contentTypeId = getContentTypeId();

      const { data } = await axiosInstance.get(
        `ms/organizations/${organization}/comments/`,
        {
          params: {
            content_type: contentTypeId,
            object_id: equipmentId,
          },
        }
      );

      return data;
    },
  });

  const postComment = useMutation({
    mutationFn: async (payload: PostCommentPayload) => {
      if (!organization || !token) {
        throw new Error("Missing required authentication or organization data");
      }

      const contentTypeId = getContentTypeId();

      const { data } = await axiosInstance.post(
        `ms/organizations/${organization}/comments/`,
        {
          text: payload.text,
          content_type: contentTypeId,
          object_id: equipmentId,
          mentioned_members: payload.mentionIds,
        }
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["equipmentComments", equipmentId],
      });
      invalidateEquipmentActivityLogs(queryClient, organization, equipmentId);
    },
    onError: (error) => {
      console.error("Failed to post comment:", error);
      throw new Error("Failed to post comment");
    },
  });

  const patchComment = useMutation({
    mutationFn: async ({
      text,
      comment_id,
      mentionIds = [],
    }: PatchCommentProps) => {
      if (!organization || !token) {
        throw new Error("Missing required authentication or organization data");
      }

      const contentTypeId = getContentTypeId();

      const { data } = await axiosInstance.patch(
        `ms/organizations/${organization}/comments/${comment_id}/`,
        {
          text,
          content_type: contentTypeId,
          object_id: equipmentId,
          mentioned_members: mentionIds,
        }
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["equipmentComments", equipmentId],
      });
      invalidateEquipmentActivityLogs(queryClient, organization, equipmentId);
    },
    onError: (error) => {
      console.error("Failed to update comment:", error);
      throw new Error("Failed to update comment");
    },
  });

  const deleteComment = useMutation({
    mutationFn: async ({ comment_id }: DeleteCommentProps) => {
      if (!organization || !token) {
        throw new Error("Missing required authentication or organization data");
      }

      await axiosInstance.delete(
        `ms/organizations/${organization}/comments/${comment_id}/`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["equipmentComments", equipmentId],
      });
      invalidateEquipmentActivityLogs(queryClient, organization, equipmentId);
    },
    onError: (error) => {
      console.error("Failed to delete comment:", error);
      throw new Error("Failed to delete comment");
    },
  });

  return {
    ...commentsQuery,
    postComment,
    patchComment,
    deleteComment,
  };
};
