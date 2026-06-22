import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { LeadsService } from "@/api/services/leadsService";
import type {
  ConvertLeadToJobArgs,
  ConvertLeadToJobResponse,
  LeadCorePointCreateArgs,
  LeadCorePointDeleteArgs,
  LeadCorePointUpdateArgs,
  LeadCreatePayload,
  LeadPatchArgs,
  LeadTrashIdArgs,
  LeadTypedEntityIdArgs,
  LeadTypedIdArgs,
} from "@/api/types";
import { LeadType, QUERY_KEYS } from "@/constants/enums";
import { getErrorMessage } from "@/utils/apiError";

import {
  invalidateJobActivityLogs,
  invalidateLeadActivityLogs,
} from "../queries/invalidateActivityLogs";
import { invalidateCalendarQueries } from "../queries/invalidateCalendarQueries";
import { useRouteIds } from "../useRouteIds";

function invalidateLeadListCaches(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEADS] });
  void queryClient.invalidateQueries({ queryKey: ["leads"] });
  void queryClient.invalidateQueries({ queryKey: ["mapDataV2"] });
}

export function useCreateDrainageTilingLead() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (data: LeadCreatePayload) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return LeadsService.createLead(organizationId, LeadType.TILING, data);
    },
    onSuccess: (created) => {
      invalidateLeadListCaches(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      if (organizationId) {
        invalidateCalendarQueries(queryClient, organizationId);
        invalidateLeadActivityLogs(queryClient, organizationId, created.id);
      }
      toast.success("Drainage tiling lead created successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to create drainage tiling lead")
      );
    },
  });
}

export function useCreateExcavationLead() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (data: LeadCreatePayload) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return LeadsService.createLead(organizationId, LeadType.EXCAVATION, data);
    },
    onSuccess: (created) => {
      invalidateLeadListCaches(queryClient);
      if (organizationId) {
        invalidateCalendarQueries(queryClient, organizationId);
        invalidateLeadActivityLogs(queryClient, organizationId, created.id);
      }
      toast.success("Excavation lead created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create excavation lead"));
    },
  });
}

export function useCreateRepairLead() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (data: LeadCreatePayload) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return LeadsService.createLead(organizationId, LeadType.REPAIR, data);
    },
    onSuccess: (created) => {
      invalidateLeadListCaches(queryClient);
      if (organizationId) {
        invalidateCalendarQueries(queryClient, organizationId);
        invalidateLeadActivityLogs(queryClient, organizationId, created.id);
      }
      toast.success("Repair lead created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create repair lead"));
    },
  });
}

export function useArchiveLead() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      id,
      leadType = LeadType.TILING,
      suppressToast = false,
    }: LeadTypedIdArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      await LeadsService.archiveLead(organizationId, leadType, id);
      return { suppressToast };
    },
    onSuccess: (data, variables) => {
      invalidateLeadListCaches(queryClient);
      if (organizationId) {
        invalidateLeadActivityLogs(queryClient, organizationId, variables.id);
      }
      if (!data.suppressToast) {
        toast.success("Lead archived successfully");
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to archive lead"));
    },
  });
}

export function useUnarchiveLead() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      id,
      leadType = LeadType.TILING,
      suppressToast = false,
    }: LeadTypedIdArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      await LeadsService.unarchiveLead(organizationId, leadType, id);
      return { suppressToast };
    },
    onSuccess: (data, variables) => {
      invalidateLeadListCaches(queryClient);
      if (organizationId) {
        invalidateLeadActivityLogs(queryClient, organizationId, variables.id);
      }
      if (!data.suppressToast) {
        toast.success("Lead unarchived successfully");
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to unarchive lead"));
    },
  });
}

export function useRestoreLead() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      id,
      leadType = LeadType.TILING,
    }: LeadTypedEntityIdArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return LeadsService.restoreLead(organizationId, leadType, id);
    },
    onSuccess: (_, variables) => {
      invalidateLeadListCaches(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["trash-data"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      if (organizationId) {
        invalidateLeadActivityLogs(queryClient, organizationId, variables.id);
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to restore lead"));
    },
  });
}

export function usePermanentDeleteLead() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      id,
      leadType = LeadType.TILING,
    }: LeadTypedEntityIdArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return LeadsService.permanentDeleteLead(organizationId, leadType, id);
    },
    onSuccess: (_, variables) => {
      invalidateLeadListCaches(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["trash-data"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      if (organizationId) {
        invalidateLeadActivityLogs(queryClient, organizationId, variables.id);
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete lead"));
    },
  });
}

export function useTrashLead() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      id,
      leadType = LeadType.TILING,
      suppressToast = false,
    }: LeadTrashIdArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      await LeadsService.trashLead(organizationId, leadType, id);
      return { suppressToast };
    },
    onSuccess: (data, variables) => {
      invalidateLeadListCaches(queryClient);
      if (organizationId) {
        invalidateLeadActivityLogs(queryClient, organizationId, variables.id);
      }
      if (!data.suppressToast) {
        toast.success("Lead trashed successfully");
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to trash lead"));
    },
  });
}

export function usePatchLead() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ id, leadType, updatedLead }: LeadPatchArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return LeadsService.updateLead(organizationId, leadType, id, updatedLead);
    },
    onSuccess: (_, variables) => {
      invalidateLeadListCaches(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["lead"] });
      void queryClient.invalidateQueries({ queryKey: ["calendarItems"] });
      void queryClient.invalidateQueries({ queryKey: ["calendarStatistics"] });
      void queryClient.invalidateQueries({ queryKey: ["calendarUnscheduled"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      if (organizationId) {
        invalidateLeadActivityLogs(queryClient, organizationId, variables.id);
      }
      toast.success("Lead updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update lead"));
    },
  });
}

export function useConvertLeadToJob() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      id,
      leadType,
      convertToJobRequest,
    }: ConvertLeadToJobArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return LeadsService.convertToJob<ConvertLeadToJobResponse>(
        organizationId,
        leadType,
        id,
        convertToJobRequest
      );
    },
    onSuccess: (response, variables) => {
      invalidateLeadListCaches(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["lead"] });
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      if (organizationId) {
        invalidateLeadActivityLogs(queryClient, organizationId, variables.id);
        const createdJobId = response?.data?.id;
        if (createdJobId != null) {
          invalidateJobActivityLogs(queryClient, organizationId, createdJobId);
        }
      }
      toast.success("Lead converted to job successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to convert lead to job"));
    },
  });
}

export function useCreateLeadCorePoint() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ leadId, data }: LeadCorePointCreateArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return LeadsService.createCorePoint(organizationId, leadId, data);
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["corePoints"] });
      if (organizationId) {
        invalidateLeadActivityLogs(
          queryClient,
          organizationId,
          variables.leadId
        );
      }
      toast.success("Core point created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create core point"));
    },
  });
}

export function useUpdateLeadCorePoint() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ leadId, coreId, data }: LeadCorePointUpdateArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return LeadsService.updateCorePoint(organizationId, leadId, coreId, data);
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["corePoints"] });
      void queryClient.invalidateQueries({ queryKey: ["corePoint"] });
      if (organizationId) {
        invalidateLeadActivityLogs(
          queryClient,
          organizationId,
          variables.leadId
        );
      }
      toast.success("Core point updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update core point"));
    },
  });
}

export function useDeleteLeadCorePoint() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ leadId, coreId }: LeadCorePointDeleteArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return LeadsService.deleteCorePoint(organizationId, leadId, coreId);
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["corePoints"] });
      void queryClient.invalidateQueries({ queryKey: ["corePoint"] });
      if (organizationId) {
        invalidateLeadActivityLogs(
          queryClient,
          organizationId,
          variables.leadId
        );
      }
      toast.success("Core point deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete core point"));
    },
  });
}
