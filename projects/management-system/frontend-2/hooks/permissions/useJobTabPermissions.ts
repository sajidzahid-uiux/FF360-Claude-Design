import { PermissionCode } from "@/constants";
import { useHasPermission } from "@/hooks/queries";

/**
 * Helper hook factory for job tab permissions
 * Note: Backend uses combined permissions for both Estimate and Financial tabs
 */
const useJobTabPermission = (permissionCode: PermissionCode): boolean => {
  const { hasPermission, isLoading } = useHasPermission(permissionCode);
  if (isLoading) return false;
  return hasPermission();
};

/**
 * Hook to check if the current user has permission to view the Estimate and Financial tabs
 * for Excavation jobs.
 * Checks for the 'jobs_excavation_estimate_financial_read' permission code.
 */
export const useHasExcavationEstimateTabPermission = (): boolean =>
  useJobTabPermission(PermissionCode.JOBS_EXCAVATION_ESTIMATE_FINANCIAL_READ);

/**
 * Hook to check if the current user has permission to view the Estimate and Financial tabs
 * for Excavation jobs.
 * Checks for the 'jobs_excavation_estimate_financial_read' permission code.
 */
export const useHasExcavationFinancialTabPermission = (): boolean =>
  useJobTabPermission(PermissionCode.JOBS_EXCAVATION_ESTIMATE_FINANCIAL_READ);

/**
 * Hook to check if the current user has permission to view the Estimate and Financial tabs
 * for Tiling jobs.
 * Checks for the 'jobs_tiling_estimate_financial_read' permission code.
 */
export const useHasTilingEstimateTabPermission = (): boolean =>
  useJobTabPermission(PermissionCode.JOBS_TILING_ESTIMATE_FINANCIAL_READ);

/**
 * Hook to check if the current user has permission to view the Estimate and Financial tabs
 * for Tiling jobs.
 * Checks for the 'jobs_tiling_estimate_financial_read' permission code.
 */
export const useHasTilingFinancialTabPermission = (): boolean =>
  useJobTabPermission(PermissionCode.JOBS_TILING_ESTIMATE_FINANCIAL_READ);

/**
 * Hook to check if the current user has permission to edit the Estimate and Financial tabs
 * for Excavation jobs.
 * Checks for the 'jobs_excavation_estimate_financial_write' permission code.
 */
export const useHasExcavationEstimateFinancialWritePermission = (): boolean =>
  useJobTabPermission(PermissionCode.JOBS_EXCAVATION_ESTIMATE_FINANCIAL_WRITE);

/**
 * Hook to check if the current user has permission to edit the Estimate and Financial tabs
 * for Tiling jobs.
 * Checks for the 'jobs_tiling_estimate_financial_write' permission code.
 */
export const useHasTilingEstimateFinancialWritePermission = (): boolean =>
  useJobTabPermission(PermissionCode.JOBS_TILING_ESTIMATE_FINANCIAL_WRITE);
