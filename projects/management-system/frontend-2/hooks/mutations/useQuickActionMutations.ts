import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QuickActionsService } from "@/api/services";
import type {
  QuickAction,
  QuickActionConvertToContactPayload,
  QuickActionConvertToContactResponse,
  QuickActionConvertToJobPayload,
  QuickActionConvertToJobResponse,
  QuickActionConvertToLeadPayload,
  QuickActionConvertToLeadResponse,
  QuickActionCreatePayload,
  QuickActionDeleteArgs,
  QuickActionFileUploadArgs,
  QuickActionIdUpdateArgs,
} from "@/api/types";
import { QUERY_KEYS } from "@/constants";
import type { ContentTypeMapping } from "@/shared/lib/contentType";

import { quickActionsKeys } from "../queries/useQuickActions";
import { useMapping } from "../useMapping";
import { useRouteIds } from "../useRouteIds";

// ============================================
// CREATE
// ============================================

export const useCreateQuickAction = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation<QuickAction, Error, QuickActionCreatePayload>({
    mutationFn: async (payload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return QuickActionsService.createQuickAction(organizationId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quickActionsKeys.all(organizationId ?? ""),
      });
      toast.success("Quick action created successfully.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create quick action.");
    },
  });
};

// ============================================
// UPDATE
// ============================================

export const useUpdateQuickAction = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation<QuickAction, Error, QuickActionIdUpdateArgs>({
    mutationFn: async ({ id, payload }) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return QuickActionsService.updateQuickAction(organizationId, id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quickActionsKeys.all(organizationId ?? ""),
      });
      toast.success("Quick action updated successfully.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update quick action.");
    },
  });
};

// ============================================
// CONVERT TO CONTACT
// ============================================

export const useConvertQuickActionToContact = (
  quickActionId: number | string | undefined
) => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation<
    QuickActionConvertToContactResponse,
    Error,
    QuickActionConvertToContactPayload
  >({
    mutationFn: async (payload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      if (quickActionId == null) throw new Error("Quick action ID is required");
      return QuickActionsService.convertToContact(
        organizationId,
        quickActionId,
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quickActionsKeys.all(organizationId ?? ""),
      });
      if (quickActionId != null) {
        queryClient.invalidateQueries({
          queryKey: quickActionsKeys.detail(
            organizationId ?? "",
            quickActionId
          ),
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["contacts", organizationId],
      });
      toast.success("Successfully converted to contact.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to convert to contact.");
    },
  });
};

// ============================================
// CONVERT TO LEAD
// ============================================

export const useConvertQuickActionToLead = (
  quickActionId: number | string | undefined
) => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation<
    QuickActionConvertToLeadResponse,
    Error,
    QuickActionConvertToLeadPayload
  >({
    mutationFn: async (payload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      if (quickActionId == null) throw new Error("Quick action ID is required");
      return QuickActionsService.convertToLead(
        organizationId,
        quickActionId,
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quickActionsKeys.all(organizationId ?? ""),
      });
      if (quickActionId != null) {
        queryClient.invalidateQueries({
          queryKey: quickActionsKeys.detail(
            organizationId ?? "",
            quickActionId
          ),
        });
      }
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.LEADS, organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["contacts", organizationId],
      });
      toast.success("Successfully converted to lead.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to convert to lead.");
    },
  });
};

// ============================================
// CONVERT TO JOB
// ============================================

export const useConvertQuickActionToJob = (
  quickActionId: number | string | undefined
) => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation<
    QuickActionConvertToJobResponse,
    Error,
    QuickActionConvertToJobPayload
  >({
    mutationFn: async (payload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      if (quickActionId == null) throw new Error("Quick action ID is required");
      return QuickActionsService.convertToJob(
        organizationId,
        quickActionId,
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quickActionsKeys.all(organizationId ?? ""),
      });
      if (quickActionId != null) {
        queryClient.invalidateQueries({
          queryKey: quickActionsKeys.detail(
            organizationId ?? "",
            quickActionId
          ),
        });
      }
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.JOBS, organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["contacts", organizationId],
      });
      toast.success("Successfully converted to job.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to convert to job.");
    },
  });
};

// ============================================
// UPLOAD FILE (view details)
// ============================================

export const useUploadQuickActionFile = (
  quickActionId: number | string | undefined
) => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();
  const { data: contentTypes } = useMapping("content_types");
  const contentTypeId = contentTypes?.find(
    (type: ContentTypeMapping) =>
      type.model === "quickaction" || type.model === "quick_action"
  )?.id;

  return useMutation<
    Awaited<ReturnType<typeof QuickActionsService.uploadFileForQuickAction>>,
    Error,
    QuickActionFileUploadArgs
  >({
    mutationFn: async ({ file, title }) => {
      if (!organizationId) throw new Error("Organization ID is required");
      if (quickActionId == null) throw new Error("Quick action ID is required");
      if (contentTypeId == null)
        throw new Error("Content type for quick action not found");
      return QuickActionsService.uploadFileForQuickAction(
        organizationId,
        quickActionId,
        contentTypeId,
        { file, title: title ?? file.name, description: "—" }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quickActionsKeys.all(organizationId ?? ""),
      });
      if (quickActionId != null) {
        queryClient.invalidateQueries({
          queryKey: quickActionsKeys.detail(
            organizationId ?? "",
            quickActionId
          ),
        });
      }
      toast.success("File uploaded.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload file.");
    },
  });
};

// ============================================
// DELETE FILE (view details)
// ============================================

export const useDeleteQuickActionFile = (
  quickActionId: number | string | undefined
) => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation<void, Error, number | string>({
    mutationFn: async (fileId) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return QuickActionsService.deleteFile(organizationId, fileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quickActionsKeys.all(organizationId ?? ""),
      });
      if (quickActionId != null) {
        queryClient.invalidateQueries({
          queryKey: quickActionsKeys.detail(
            organizationId ?? "",
            quickActionId
          ),
        });
      }
      toast.success("File removed.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove file.");
    },
  });
};

// ============================================
// DELETE
// ============================================

export const useDeleteQuickAction = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation<void, Error, number | string | QuickActionDeleteArgs>({
    mutationFn: async (variable) => {
      if (!organizationId) throw new Error("Organization ID is required");
      const id = typeof variable === "object" ? variable.id : variable;
      return QuickActionsService.deleteQuickAction(organizationId, id);
    },
    onSuccess: (_, variable) => {
      queryClient.invalidateQueries({
        queryKey: quickActionsKeys.all(organizationId ?? ""),
      });
      const silent = typeof variable === "object" && variable.silent;
      if (!silent) {
        toast.success("Quick action deleted.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete quick action.");
    },
  });
};
