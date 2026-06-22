import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { JobsService } from "@/api/services/jobsService";
import type {
  FinancialMachineAssignmentCreateArgs,
  FinancialMachineAssignmentDeleteArgs,
  FinancialMachineAssignmentUpdateArgs,
  JobActiveInvoice,
  JobCorePointCreateArgs,
  JobCorePointDeleteArgs,
  JobCorePointUpdateArgs,
  JobCreatePayload,
  JobEstimateUpdateArgs,
  JobFinancialUpdateArgs,
  JobIdArgs,
  JobPatchArgs,
  JobTrashIdArgs,
  JobTypedEntityIdArgs,
  JobTypedIdArgs,
} from "@/api/types";
import { JobType, QUERY_KEYS } from "@/constants/enums";
import { getErrorMessage } from "@/utils/apiError";

import { invalidateJobActivityLogs } from "../queries/invalidateActivityLogs";
import { invalidateCalendarQueries } from "../queries/invalidateCalendarQueries";
import {
  invalidateJobStakeholderDependentCaches,
  jobUpdateAffectsStakeholderListViews,
} from "../queries/invalidateJobStakeholderCaches";
import { useRouteIds } from "../useRouteIds";

function invalidateJobListCaches(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
  void queryClient.invalidateQueries({ queryKey: ["jobHistory"] });
  void queryClient.invalidateQueries({ queryKey: ["allJobs"] });
  void queryClient.invalidateQueries({ queryKey: ["mapDataV2"] });
}

export function useCreateDrainageTilingJob() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (data: JobCreatePayload) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.createJob(organizationId, JobType.TILING, data);
    },
    onSuccess: (created) => {
      invalidateJobListCaches(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      if (organizationId) {
        invalidateCalendarQueries(queryClient, organizationId);
        invalidateJobActivityLogs(queryClient, organizationId, created.id);
      }
      toast.success("Drainage tiling job created successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to create drainage tiling job")
      );
    },
  });
}

export function useCreateExcavationJob() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (data: JobCreatePayload) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.createJob(organizationId, JobType.EXCAVATION, data);
    },
    onSuccess: (created) => {
      invalidateJobListCaches(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      if (organizationId) {
        invalidateCalendarQueries(queryClient, organizationId);
        invalidateJobActivityLogs(queryClient, organizationId, created.id);
      }
      toast.success("Excavation job created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create excavation job"));
    },
  });
}

export function useCreateRepairJob() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (data: JobCreatePayload) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.createJob(organizationId, JobType.REPAIR, data);
    },
    onSuccess: (created) => {
      invalidateJobListCaches(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      if (organizationId) {
        invalidateCalendarQueries(queryClient, organizationId);
        invalidateJobActivityLogs(queryClient, organizationId, created.id);
      }
      toast.success("Repair job created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create repair job"));
    },
  });
}

export function useArchiveJob() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ id, jobType = JobType.TILING }: JobTypedIdArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.archiveJob(organizationId, jobType, id);
    },
    onSuccess: (_, variables) => {
      invalidateJobListCaches(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.id);
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to archive job"));
    },
  });
}

export function useUnarchiveJob() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ id, jobType = JobType.TILING }: JobTypedIdArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.unarchiveJob(organizationId, jobType, id);
    },
    onSuccess: (_, variables) => {
      invalidateJobListCaches(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.id);
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to unarchive job"));
    },
  });
}

export function useTrashJob() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ id, jobType = JobType.TILING }: JobTrashIdArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.trashJob(organizationId, jobType, id);
    },
    onSuccess: (_, variables) => {
      invalidateJobListCaches(queryClient);
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.id);
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to trash job"));
    },
  });
}

export function useRestoreJob() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      id,
      jobType = JobType.TILING,
    }: JobTypedEntityIdArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.restoreJob(organizationId, jobType, id);
    },
    onSuccess: (_, variables) => {
      invalidateJobListCaches(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["trash-data"] });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.JOBS, variables.jobType],
      });
      void queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.id);
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to restore job"));
    },
  });
}

export function usePermanentDeleteJob() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      id,
      jobType = JobType.TILING,
    }: JobTypedEntityIdArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.permanentDeleteJob(organizationId, jobType, id);
    },
    onSuccess: (_, variables) => {
      invalidateJobListCaches(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["trash-data"] });
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.id);
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete job"));
    },
  });
}

export function useTrashAndDeleteJob() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      id,
      jobType = JobType.TILING,
    }: JobTypedEntityIdArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      await JobsService.trashJob(organizationId, jobType, id);
      return JobsService.permanentDeleteJob(organizationId, jobType, id);
    },
    onSuccess: (_, variables) => {
      invalidateJobListCaches(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["trash-data"] });
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.id);
      }
      toast.success("Job deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete job"));
    },
  });
}

export function usePatchJob() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      id,
      updatedJob,
      notApproved = false,
      jobType = JobType.TILING,
    }: JobPatchArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.updateJob(
        organizationId,
        jobType,
        id,
        updatedJob,
        notApproved
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update job"));
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      void queryClient.invalidateQueries({ queryKey: ["job"] });
      void queryClient.invalidateQueries({ queryKey: ["jobHistory"] });
      void queryClient.invalidateQueries({ queryKey: ["completedJob"] });
      void queryClient.invalidateQueries({ queryKey: ["allJobs"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      void queryClient.invalidateQueries({ queryKey: ["mapDataV2"] });
      if (
        variables?.updatedJob &&
        jobUpdateAffectsStakeholderListViews(variables.updatedJob)
      ) {
        invalidateJobStakeholderDependentCaches(queryClient);
      }
      if (organizationId) {
        invalidateCalendarQueries(queryClient, organizationId);
        if (variables?.id != null) {
          invalidateJobActivityLogs(queryClient, organizationId, variables.id);
        }
      }
    },
  });
}

export function useUpdateJobEstimate() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      id,
      estimateNumber,
      jobType = JobType.TILING,
    }: JobEstimateUpdateArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.updateJobEstimate(
        organizationId,
        jobType,
        id,
        estimateNumber
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update estimate number"));
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      void queryClient.invalidateQueries({ queryKey: ["job"] });
      void queryClient.invalidateQueries({ queryKey: ["jobHistory"] });
      void queryClient.invalidateQueries({ queryKey: ["jobEstimate"] });
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.id);
      }
      toast.success("Estimate saved successfully");
    },
  });
}

export function useGetJobActiveInvoices() {
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ id }: JobIdArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.getJobActiveInvoices(organizationId, id) as Promise<
        JobActiveInvoice[]
      >;
    },
  });
}

export function useCreateJobInvoice() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      id,
      jobType = JobType.TILING,
    }: JobTypedEntityIdArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.createInvoice(organizationId, jobType, id);
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      void queryClient.invalidateQueries({ queryKey: ["job"] });
      void queryClient.invalidateQueries({ queryKey: ["jobHistory"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
      if (organizationId && variables?.id != null) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.id);
      }
    },
  });
}

export function useOrderPipesForJob() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ id }: JobIdArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.orderPipes(organizationId, id);
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      void queryClient.invalidateQueries({ queryKey: ["job"] });
      void queryClient.invalidateQueries({ queryKey: ["jobHistory"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      void queryClient.invalidateQueries({ queryKey: ["vendorJob"] });
      if (organizationId && variables?.id != null) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.id);
      }
    },
  });
}

export function useCreateJobCorePoint() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ jobId, data }: JobCorePointCreateArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.createCorePoint(organizationId, jobId, data);
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["corePoints"] });
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.jobId);
      }
      toast.success("Core point created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create core point"));
    },
  });
}

export function useUpdateJobCorePoint() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ jobId, coreId, data }: JobCorePointUpdateArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.updateCorePoint(organizationId, jobId, coreId, data);
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["corePoints"] });
      void queryClient.invalidateQueries({ queryKey: ["corePoint"] });
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.jobId);
      }
      toast.success("Core point updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update core point"));
    },
  });
}

export function useDeleteJobCorePoint() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ jobId, coreId }: JobCorePointDeleteArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.deleteCorePoint(organizationId, jobId, coreId);
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["corePoints"] });
      void queryClient.invalidateQueries({ queryKey: ["corePoint"] });
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.jobId);
      }
      toast.success("Core point deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete core point"));
    },
  });
}

export function useUpdateJobFinancial() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ jobId, jobType, data }: JobFinancialUpdateArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      const financial = await JobsService.getJobFinancial(
        organizationId,
        jobType,
        jobId
      );
      return JobsService.updateJobFinancial(
        organizationId,
        jobType,
        jobId,
        financial.id,
        data
      );
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [
          "jobFinancial",
          organizationId,
          variables.jobType,
          variables.jobId,
        ],
      });
      void queryClient.invalidateQueries({ queryKey: ["job"] });
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.jobId);
      }
      toast.success("Financial data updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update financial data"));
    },
  });
}

export function useCreateFinancialMachineAssignment() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      jobId,
      jobType,
      data,
    }: FinancialMachineAssignmentCreateArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.createFinancialMachineAssignment(
        organizationId,
        jobType,
        jobId,
        data
      );
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [
          "financialMachineAssignments",
          organizationId,
          variables.jobType,
          variables.jobId,
        ],
      });
      void queryClient.invalidateQueries({
        queryKey: [
          "jobFinancial",
          organizationId,
          variables.jobType,
          variables.jobId,
        ],
      });
      void queryClient.invalidateQueries({ queryKey: ["job"] });
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.jobId);
      }
      toast.success("Machine assignment created successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to create machine assignment")
      );
    },
  });
}

export function useUpdateFinancialMachineAssignment() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      jobId,
      jobType,
      assignmentId,
      data,
    }: FinancialMachineAssignmentUpdateArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.updateFinancialMachineAssignment(
        organizationId,
        jobType,
        jobId,
        assignmentId,
        data
      );
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [
          "financialMachineAssignments",
          organizationId,
          variables.jobType,
          variables.jobId,
        ],
      });
      void queryClient.invalidateQueries({
        queryKey: [
          "jobFinancial",
          organizationId,
          variables.jobType,
          variables.jobId,
        ],
      });
      void queryClient.invalidateQueries({ queryKey: ["job"] });
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.jobId);
      }
      toast.success("Machine assignment updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to update machine assignment")
      );
    },
  });
}

export function useDeleteFinancialMachineAssignment() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      jobId,
      jobType,
      assignmentId,
    }: FinancialMachineAssignmentDeleteArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.deleteFinancialMachineAssignment(
        organizationId,
        jobType,
        jobId,
        assignmentId
      );
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [
          "financialMachineAssignments",
          organizationId,
          variables.jobType,
          variables.jobId,
        ],
      });
      void queryClient.invalidateQueries({
        queryKey: [
          "jobFinancial",
          organizationId,
          variables.jobType,
          variables.jobId,
        ],
      });
      void queryClient.invalidateQueries({ queryKey: ["job"] });
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, variables.jobId);
      }
      toast.success("Machine assignment deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to delete machine assignment")
      );
    },
  });
}
