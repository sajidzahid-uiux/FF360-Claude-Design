import { toast } from "sonner";

import type { MachineUpdatePayload } from "@/api/types";
import { AddMaintenanceFilterModal } from "@/features/equipment";
import type { useShowMoreMachineCard } from "@/features/equipment/hooks/useShowMoreMachineCard";
import { ALL_AVAILABLE_FILTERS } from "@/features/equipment/model/maintenance-filters";
import type { MachineDetailRecord } from "@/features/equipment/model/show-more-card";
import { AddMaintenanceFilterDropdown } from "@/features/equipment/ui";
import { Card } from "@/shared/ui/primitives";
import { getErrorMessage } from "@/utils/apiError";

import MaintenanceCard from "../../../maintenance/MaintenanceCard";

type Vm = ReturnType<typeof useShowMoreMachineCard>;

interface Props {
  vm: Vm;
}

export function ShowMoreMachineFiltersTab({ vm }: Props) {
  const {
    machineData,
    setMachineData,
    effectiveCanWrite,
    isDisabled,
    availableFiltersToAdd,
    isAddFilterModalOpen,
    setIsAddFilterModalOpen,
    selectedNewFilter,
    addFilterError,
    setAddFilterError,
    setSelectedNewFilter,
    editingFilter,
    editingFilterValues,
    setEditingFilterValues,
    filterCardCurrentHours,
    handleAddFilterSubmit,
    handleStartEditFilter,
    handleCancelEditFilter,
    handleSaveEditFilter,
    dialogManager,
    updateMachine,
    machineRecordId,
  } = vm;

  return (
    <div>
      {/* Maintenance Filters */}
      <Card className="mb-8 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="text-lg font-semibold sm:text-xl">
            Maintenance Filters
          </div>
          {/* Add Filter Dropdown */}
          {effectiveCanWrite && (
            <AddMaintenanceFilterDropdown
              availableFilters={availableFiltersToAdd}
              disabled={isDisabled || !effectiveCanWrite}
              onFilterSelect={(filter) => {
                setAddFilterError(null);
                setSelectedNewFilter(filter);
                setIsAddFilterModalOpen(true);
              }}
            />
          )}

          {/* Add Filter Modal */}
          <AddMaintenanceFilterModal
            error={addFilterError}
            maxLastChanged={Number(machineData.current_hours) || undefined}
            open={isAddFilterModalOpen}
            title={selectedNewFilter?.title || ""}
            onAdd={handleAddFilterSubmit}
            onOpenChange={setIsAddFilterModalOpen}
          />
        </div>
        {machineData.maintenance_attributes &&
        machineData.maintenance_attributes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {machineData.maintenance_attributes
              .filter((attr) =>
                ALL_AVAILABLE_FILTERS.some((f) => f.name === attr.title)
              )
              .map((attr) => {
                const filterDefinition = ALL_AVAILABLE_FILTERS.find(
                  (f) => f.name === attr.title
                );
                const isEditing = editingFilter === attr.title;
                const lastChangedVal = isEditing
                  ? editingFilterValues.last_changed
                  : attr.last_changed === undefined
                    ? ""
                    : attr.last_changed;
                const thresholdVal = isEditing
                  ? editingFilterValues.threshold
                  : attr.threshold === undefined
                    ? ""
                    : attr.threshold;
                const filterNumberVal = isEditing
                  ? editingFilterValues.filter_number
                  : attr.filter_number || null;
                let countdown = "";
                let maintenanceRequired = false;
                if (
                  filterCardCurrentHours !== undefined &&
                  lastChangedVal !== "" &&
                  thresholdVal !== ""
                ) {
                  countdown = String(
                    Number(thresholdVal) -
                      (filterCardCurrentHours - Number(lastChangedVal))
                  );
                  const remaining =
                    Number(thresholdVal) -
                    (filterCardCurrentHours - Number(lastChangedVal));
                  maintenanceRequired = remaining < 0;
                }
                return (
                  <MaintenanceCard
                    key={attr.title}
                    canWrite={effectiveCanWrite}
                    countdown={countdown}
                    currentHours={Number(machineData.current_hours)}
                    disabled={isDisabled}
                    filterNumber={filterNumberVal}
                    isEditing={isEditing}
                    lastChanged={lastChangedVal}
                    maintenanceRequired={maintenanceRequired}
                    threshold={thresholdVal}
                    title={filterDefinition?.title || attr.title}
                    onCancel={handleCancelEditFilter}
                    onChange={(
                      field: "lastChanged" | "threshold" | "filterNumber",
                      value: string
                    ) => {
                      setEditingFilterValues((v) => ({
                        ...v,
                        [field === "lastChanged"
                          ? "last_changed"
                          : field === "threshold"
                            ? "threshold"
                            : "filter_number"]: value,
                      }));
                    }}
                    onDelete={() => {
                      const filterTitle = filterDefinition?.title || attr.title;
                      const filterTitleToDelete = attr.title;
                      dialogManager.openConfirmationDialog({
                        title: "Remove Filter",
                        description: `Are you sure you want to remove this filter?`,
                        variant: "destructive",
                        confirmButtonText: "Yes",
                        onConfirm: async () => {
                          const currentAttributes =
                            machineData.maintenance_attributes || [];
                          const updatedAttributes = currentAttributes.filter(
                            (filter) => filter.title !== filterTitleToDelete
                          );
                          try {
                            const updatedMachine =
                              await updateMachine.mutateAsync({
                                id: machineRecordId,
                                data: {
                                  maintenance_attributes:
                                    updatedAttributes as MachineUpdatePayload["maintenance_attributes"],
                                },
                              });
                            setMachineData((prev: MachineDetailRecord) => ({
                              ...prev,
                              maintenance_attributes:
                                updatedMachine.maintenance_attributes,
                            }));
                            toast.success(
                              `${filterTitle} filter removed successfully`
                            );
                            dialogManager.closeDialog();
                          } catch (error: unknown) {
                            console.error("Failed to delete filter:", error);
                            toast.error(
                              getErrorMessage(error, "Failed to remove filter")
                            );
                            dialogManager.setConfirmationProcessing(false);
                            throw error;
                          }
                        },
                      });
                    }}
                    onEdit={
                      effectiveCanWrite
                        ? () => handleStartEditFilter(attr)
                        : undefined
                    }
                    onSave={handleSaveEditFilter}
                  />
                );
              })}
          </div>
        ) : (
          <p className="text-text-muted">
            No maintenance filters set up for this machine.
          </p>
        )}
      </Card>
    </div>
  );
}
