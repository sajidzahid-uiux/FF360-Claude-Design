import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import type { AuthUser, AuthUserUpdatePayload } from "@/api/types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import axiosInstance from "@/lib/axios";
import type { ApiErrorResponse } from "@/utils/apiError";

function useUserData() {
  const queryClient = useQueryClient();
  const { logout, currentUser: user } = useAuth();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const userQuery = useQuery<AuthUser>({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await axiosInstance.get<AuthUser>(
        `/auth/users/${user.id}/`
      );
      return response.data;
    },
  });

  const getUsers = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.get<AuthUser[]>("/auth/users/");
      return response.data;
    },
    onError: (error) => {
      console.error("Error fetching user:", error);
    },
  });

  const updateUserEmailAndPassword = useMutation({
    mutationFn: async ({
      updatedUser,
    }: {
      updatedUser: AuthUserUpdatePayload;
    }) => {
      const response = await axiosInstance.patch<AuthUser>(
        "/auth/users/update",
        updatedUser
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"], exact: true });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({
      updatedUser,
    }: {
      updatedUser: AuthUserUpdatePayload;
    }) => {
      try {
        const response = await axiosInstance.patch<AuthUser>(
          `/auth/users/${user.id}/`,
          updatedUser
        );
        return response.data;
      } catch (error: unknown) {
        if (isAxiosError<ApiErrorResponse>(error)) {
          toast.error(error.response?.data?.non_field_errors?.[0]);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"], exact: true });
    },
  });

  const removeUser = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/auth/users/${user.id}/`);
      logout();
      queryClient.invalidateQueries({ queryKey: ["user"], exact: true });
    },
  });

  return {
    ...userQuery,
    updateUser,
    removeUser,
    getUsers,
    updateUserEmailAndPassword,
  };
}

export default useUserData;
