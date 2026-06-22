"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { TableSortRule, TableViewMode } from "@fieldflow360/org-ui";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  EquipmentTypeEnum,
  type EquipmentV2,
  type MachineCreatePayload,
  type MachineUpdatePayload,
  type TrailerCreatePayload,
  type TrailerUpdatePayload,
  type VehicleCreatePayload,
  type VehicleUpdatePayload,
} from "@/api/types";
import { type NotKanbanView, SortOrder, ViewMode } from "@/constants";
import {
  AddEquipmentModal,
  AddEquipmentSubmitPayload,
  type EquipmentPageData,
  EquipmentTable,
  type MachinePageData,
  type MachineSubmitData,
  type TrailerPageData,
  type TrailerSubmitData,
  type VehiclePageData,
  type VehicleSubmitData,
  buildEquipmentDetailHref,
  buildEquipmentLogsHref,
  getEquipmentDisplayName,
  getEquipmentRecordId,
  getEquipmentType,
  normalizeEquipmentType,
} from "@/features/equipment";
import {
  loadMachineForm,
  loadTrailerForm,
  loadVehicleForm,
} from "@/features/equipment/lib/equipmentFormLoaders";
import { useEquipmentPageUi } from "@/features/equipment/model/equipment-page-store";
import {
  VIEW_LIST_GRID,
  useDialogManager,
  useRouteIds,
  useViewPreference,
} from "@/hooks";
import {
  useCreateMachine,
  useCreateTrailer,
  useCreateVehicle,
  useTrashMachine,
  useTrashTrailer,
  useTrashVehicle,
  useUpdateMachine,
  useUpdateTrailer,
  useUpdateVehicle,
} from "@/hooks/mutations";
import { useRoutePermissions } from "@/hooks/permissions";
import { useAllEquipment } from "@/hooks/queries";
import { APP_ROUTES, orgPath } from "@/shared/config/routes";
import { bulkConfirmationCopy } from "@/shared/lib";
import {
  CMS_DEFAULT_PAGE_SIZE as DEFAULT_PAGE_SIZE,
  cmsPaginationSourceFromResponse,
  createCmsTableStateKey,
  useCmsServerTableQuery,
} from "@/shared/lib/table";
import { DialogManager, PageRenderer } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";
import { getErrorMessage, isApiForbiddenError } from "@/utils/apiError";

const EQUIPMENT_TYPE_FILTER_ID = "equipment_type";

type EquipmentImageField =
  | "equipment_image"
  | "insurance_image"
  | "registration_image"
  | "serial_number_image";

interface EquipmentPaginationData {
  results?: EquipmentV2[];
  total_count?: number;
  count?: number;
  total_pages?: number;
  page_size?: number;
}

function appendImageFields(
  formData: FormData,
  values: Partial<Record<EquipmentImageField, File | null | undefined>>,
  fields: EquipmentImageField[]
): boolean {
  let hasImages = false;

  for (const field of fields) {
    const value = values[field];
    if (value instanceof File) {
      formData.append(field, value);
      hasImages = true;
    }
  }

  return hasImages;
}

function equipmentSortRulesToSortOrder(
  rules: TableSortRule[]
): SortOrder | undefined {
  const firstRule = rules[0];
  if (!firstRule) return undefined;
  return firstRule.direction === "asc" ? SortOrder.ASC : SortOrder.DESC;
}

function sortOrderToEquipmentSortRules(
  sortOrder: SortOrder | undefined
): TableSortRule[] {
  if (!sortOrder) return [];
  return [
    {
      columnKey: "machine_name",
      direction: sortOrder === SortOrder.ASC ? "asc" : "desc",
    },
  ];
}

function getEquipmentResults(data: unknown): EquipmentV2[] {
  if (Array.isArray(data)) return data as EquipmentV2[];
  if (data && typeof data === "object" && "results" in data) {
    return ((data as EquipmentPaginationData).results ?? []) as EquipmentV2[];
  }
  return [];
}

function toEquipmentRows(data: unknown): EquipmentPageData[] {
  return getEquipmentResults(data).map((item) => {
    const type = getEquipmentType(item);
    const equipmentId = item.equipment_ptr_id || item.id;

    return {
      ...item,
      id: equipmentId,
      equipment_ptr_id: equipmentId,
      equipment_type: type,
    };
  });
}

export default function EquipmentPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { orgId } = useRouteIds();
  const dialogManager = useDialogManager();
  const {
    selectedIds,
    editingEquipment,
    addEquipmentType,
    setSelectedIds,
    setEditingEquipment,
    setAddEquipmentType,
  } = useEquipmentPageUi();
  const { view: currentView, setView } = useViewPreference(
    ViewMode.LIST,
    VIEW_LIST_GRID
  );

  const tableKey = useMemo(
    () =>
      createCmsTableStateKey({
        pathname,
        orgId: orgId ? Number(orgId) : null,
        tabKey: "equipment",
      }) ?? "equipment",
    [orgId, pathname]
  );

  const [lastTotalPages, setLastTotalPages] = useState<number | undefined>();

  const {
    currentPage,
    debouncedSearch: debouncedSearchTerm,
    filterValues,
    setFilterValues,
    sortRules,
    setSortRules,
    searchConfig,
    buildPagination,
  } = useCmsServerTableQuery({
    tableKey,
    onQueryChange: () => {},
    totalPages: lastTotalPages,
  });

  const {
    read: canViewEquipment,
    write: canEditEquipment,
    delete: canDeleteEquipment,
  } = useRoutePermissions() || {};

  const sortOrder = useMemo(
    () => equipmentSortRulesToSortOrder(sortRules),
    [sortRules]
  );

  const selectedEquipmentTypes = useMemo(
    () =>
      filterValues.find((value) => value.filterId === EQUIPMENT_TYPE_FILTER_ID)
        ?.values ?? [],
    [filterValues]
  );

  const equipmentQueryParams = useMemo<Parameters<typeof useAllEquipment>[0]>(
    () => ({
      search: debouncedSearchTerm || undefined,
      page: currentPage,
      page_size: DEFAULT_PAGE_SIZE,
      sort_order: sortOrder,
      equipment_type:
        selectedEquipmentTypes.length > 0
          ? selectedEquipmentTypes.join(",")
          : undefined,
    }),
    [currentPage, debouncedSearchTerm, selectedEquipmentTypes, sortOrder]
  );

  const equipmentQuery = useAllEquipment(equipmentQueryParams);
  const createMachine = useCreateMachine();
  const updateMachine = useUpdateMachine();
  const trashMachine = useTrashMachine();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const trashVehicle = useTrashVehicle();
  const createTrailer = useCreateTrailer();
  const updateTrailer = useUpdateTrailer();
  const trashTrailer = useTrashTrailer();

  const equipmentData = useMemo(
    () => toEquipmentRows(equipmentQuery.data),
    [equipmentQuery.data]
  );

  const paginationSource = useMemo(
    () =>
      cmsPaginationSourceFromResponse(
        equipmentQuery.data as Parameters<
          typeof cmsPaginationSourceFromResponse
        >[0]
      ),
    [equipmentQuery.data]
  );

  const pagination = useMemo(
    () =>
      buildPagination({
        source: paginationSource,
        itemLabel: "equipment items",
        isLoading: equipmentQuery.isFetching,
      }),
    [buildPagination, equipmentQuery.isFetching, paginationSource]
  );

  useEffect(() => {
    if (pagination?.totalPages) {
      setLastTotalPages(pagination.totalPages);
    }
  }, [pagination?.totalPages]);

  useEffect(() => {
    if (selectedIds.length === 0) return;
    const validIds = new Set(equipmentData.map((item) => String(item.id)));
    const nextIds = selectedIds.filter((id) => validIds.has(String(id)));
    if (nextIds.length !== selectedIds.length) {
      setSelectedIds(nextIds);
    }
  }, [equipmentData, selectedIds, setSelectedIds]);

  const invalidateEquipment = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["equipmentV2", "all"] });
  }, [queryClient]);

  const handleViewEquipment = useCallback(
    (equipment: EquipmentPageData) => {
      if (!orgId) return;
      router.push(buildEquipmentDetailHref(orgId, equipment));
    },
    [orgId, router]
  );

  const handleEquipmentLogs = useCallback(
    (equipment: EquipmentPageData) => {
      if (!orgId) return;
      router.push(buildEquipmentLogsHref(orgId, equipment));
    },
    [orgId, router]
  );

  const trashEquipment = useCallback(
    async (equipment: EquipmentPageData) => {
      const equipmentType = normalizeEquipmentType(equipment.equipment_type);
      const equipmentId = getEquipmentRecordId(equipment);

      if (equipmentType === EquipmentTypeEnum.MACHINE) {
        await trashMachine.mutateAsync(equipmentId);
        return;
      }
      if (equipmentType === EquipmentTypeEnum.VEHICLE) {
        await trashVehicle.mutateAsync(equipmentId);
        return;
      }
      if (equipmentType === EquipmentTypeEnum.TRAILER) {
        await trashTrailer.mutateAsync(equipmentId);
        return;
      }

      throw new Error("Unknown equipment type");
    },
    [trashMachine, trashTrailer, trashVehicle]
  );

  const handleDeleteEquipment = useCallback(
    (equipment: EquipmentPageData) => {
      const equipmentName = getEquipmentDisplayName(equipment);

      dialogManager.openConfirmationDialog({
        title: "Move to Trash",
        confirmationType: "delete",
        itemTitle: equipmentName,
        trash: true,
        variant: "destructive",
        confirmButtonText: "Move to Trash",
        onConfirm: async () => {
          try {
            dialogManager.setConfirmationProcessing(true);
            dialogManager.setConfirmationProgress(50, equipmentName);
            await trashEquipment(equipment);
            invalidateEquipment();
            dialogManager.setConfirmationProgress(100);
            toast.success("Equipment trashed successfully");
            dialogManager.closeDialog();
          } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to trash equipment"));
            dialogManager.setConfirmationProcessing(false);
            throw error;
          }
        },
      });
    },
    [dialogManager, invalidateEquipment, trashEquipment]
  );

  const handleBulkDelete = useCallback(
    (ids: (string | number)[]) => {
      const selectedEquipment = equipmentData.filter((equipment) =>
        ids.some((id) => String(id) === String(equipment.id))
      );

      if (selectedEquipment.length === 0) {
        toast.error("No equipment selected");
        return;
      }

      const count = selectedEquipment.length;
      const { title, description, confirmButtonText } = bulkConfirmationCopy({
        count,
        entitySingular: "equipment item",
        entityPlural: "equipment items",
        action: "trash",
        confirmSingle: "Move to Trash",
        confirmPlural: "Move to Trash",
      });

      dialogManager.openConfirmationDialog({
        confirmationType: "delete",
        title,
        description,
        variant: "destructive",
        confirmButtonText,
        onConfirm: async () => {
          try {
            dialogManager.setConfirmationProcessing(true);

            for (let i = 0; i < selectedEquipment.length; i += 1) {
              const equipment = selectedEquipment[i];
              dialogManager.setConfirmationProgress(
                Math.round((i / selectedEquipment.length) * 100),
                getEquipmentDisplayName(equipment)
              );
              await trashEquipment(equipment);
            }

            invalidateEquipment();
            dialogManager.setConfirmationProgress(100);
            toast.success(
              count === 1
                ? "Equipment item trashed successfully"
                : `${count} equipment items trashed successfully`
            );
            setSelectedIds([]);
            dialogManager.closeDialog();
          } catch (error: unknown) {
            if (isApiForbiddenError(error)) {
              toast.error("You do not have permission to delete equipment.");
            } else {
              toast.error(
                getErrorMessage(error, "Failed to trash selected equipment")
              );
            }
            dialogManager.setConfirmationProcessing(false);
          }
        },
      });
    },
    [
      dialogManager,
      equipmentData,
      invalidateEquipment,
      setSelectedIds,
      trashEquipment,
    ]
  );

  const handleAddMachine = useCallback(
    async (formData: MachineSubmitData): Promise<boolean> => {
      try {
        const { equipment_image, serial_number_image, ...restData } = formData;
        const createdEquipment = await createMachine.mutateAsync(
          restData as MachineCreatePayload
        );
        const equipmentId =
          createdEquipment.id || createdEquipment.equipment_ptr_id;
        const imageFormData = new FormData();

        if (
          appendImageFields(
            imageFormData,
            { equipment_image, serial_number_image },
            ["equipment_image", "serial_number_image"]
          )
        ) {
          await updateMachine.mutateAsync({
            id: equipmentId,
            data: imageFormData as unknown as MachineUpdatePayload,
          });
        }

        invalidateEquipment();
        return true;
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to add machine."));
        return false;
      }
    },
    [createMachine, invalidateEquipment, updateMachine]
  );

  const handleEditMachineSubmit = useCallback(
    async (formData: MachineSubmitData) => {
      if (!editingEquipment) return;

      try {
        const { equipment_image, serial_number_image, ...restData } = formData;
        const equipmentId = getEquipmentRecordId(editingEquipment);
        await updateMachine.mutateAsync({
          id: equipmentId,
          data: restData as MachineUpdatePayload,
        });

        const imageFormData = new FormData();
        if (
          appendImageFields(
            imageFormData,
            { equipment_image, serial_number_image },
            ["equipment_image", "serial_number_image"]
          )
        ) {
          await updateMachine.mutateAsync({
            id: equipmentId,
            data: imageFormData as unknown as MachineUpdatePayload,
          });
        }

        dialogManager.closeDialog();
        setEditingEquipment(null);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to update machine."));
      }
    },
    [dialogManager, editingEquipment, setEditingEquipment, updateMachine]
  );

  const handleAddTrailer = useCallback(
    async (formData: TrailerSubmitData): Promise<boolean> => {
      try {
        const {
          equipment_image,
          insurance_image,
          registration_image,
          serial_number_image,
          ...restData
        } = formData;
        const createdTrailer = await createTrailer.mutateAsync(
          restData as TrailerCreatePayload
        );
        const equipmentId =
          createdTrailer.id || createdTrailer.equipment_ptr_id;
        const imageFormData = new FormData();

        if (
          appendImageFields(
            imageFormData,
            {
              equipment_image,
              insurance_image,
              registration_image,
              serial_number_image,
            },
            [
              "equipment_image",
              "insurance_image",
              "registration_image",
              "serial_number_image",
            ]
          )
        ) {
          await updateTrailer.mutateAsync({
            id: equipmentId,
            data: imageFormData as unknown as TrailerUpdatePayload,
          });
        }

        invalidateEquipment();
        return true;
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to add trailer."));
        return false;
      }
    },
    [createTrailer, invalidateEquipment, updateTrailer]
  );

  const handleEditTrailerSubmit = useCallback(
    async (formData: TrailerSubmitData) => {
      if (!editingEquipment) return;

      try {
        const {
          equipment_image,
          insurance_image,
          registration_image,
          serial_number_image,
          ...restData
        } = formData;
        const equipmentId = getEquipmentRecordId(editingEquipment);
        await updateTrailer.mutateAsync({
          id: equipmentId,
          data: restData as TrailerUpdatePayload,
        });

        const imageFormData = new FormData();
        if (
          appendImageFields(
            imageFormData,
            {
              equipment_image,
              insurance_image,
              registration_image,
              serial_number_image,
            },
            [
              "equipment_image",
              "insurance_image",
              "registration_image",
              "serial_number_image",
            ]
          )
        ) {
          await updateTrailer.mutateAsync({
            id: equipmentId,
            data: imageFormData as unknown as TrailerUpdatePayload,
          });
        }

        dialogManager.closeDialog();
        setEditingEquipment(null);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to update trailer."));
      }
    },
    [dialogManager, editingEquipment, setEditingEquipment, updateTrailer]
  );

  const handleAddVehicle = useCallback(
    async (formData: VehicleSubmitData): Promise<boolean> => {
      try {
        const {
          equipment_image,
          insurance_image,
          registration_image,
          serial_number_image,
          ...restData
        } = formData;
        const createdVehicle = await createVehicle.mutateAsync(
          restData as VehicleCreatePayload
        );
        const equipmentId =
          createdVehicle.id || createdVehicle.equipment_ptr_id;
        const imageFormData = new FormData();

        if (
          appendImageFields(
            imageFormData,
            {
              equipment_image,
              insurance_image,
              registration_image,
              serial_number_image,
            },
            [
              "equipment_image",
              "insurance_image",
              "registration_image",
              "serial_number_image",
            ]
          )
        ) {
          await updateVehicle.mutateAsync({
            id: equipmentId,
            data: imageFormData as unknown as VehicleUpdatePayload,
          });
        }

        invalidateEquipment();
        return true;
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to create vehicle"));
        return false;
      }
    },
    [createVehicle, invalidateEquipment, updateVehicle]
  );

  const handleEditVehicleSubmit = useCallback(
    async (formData: VehicleSubmitData) => {
      if (!editingEquipment) return;

      try {
        const {
          equipment_image,
          insurance_image,
          registration_image,
          serial_number_image,
          ...restData
        } = formData;
        const equipmentId = getEquipmentRecordId(editingEquipment);
        await updateVehicle.mutateAsync({
          id: equipmentId,
          data: restData as VehicleUpdatePayload,
        });

        const imageFormData = new FormData();
        if (
          appendImageFields(
            imageFormData,
            {
              equipment_image,
              insurance_image,
              registration_image,
              serial_number_image,
            },
            [
              "equipment_image",
              "insurance_image",
              "registration_image",
              "serial_number_image",
            ]
          )
        ) {
          await updateVehicle.mutateAsync({
            id: equipmentId,
            data: imageFormData as unknown as VehicleUpdatePayload,
          });
        }

        dialogManager.closeDialog();
        setEditingEquipment(null);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to update vehicle"));
      }
    },
    [dialogManager, editingEquipment, setEditingEquipment, updateVehicle]
  );

  const closeEquipmentDialog = useCallback(() => {
    dialogManager.closeDialog();
    setEditingEquipment(null);
  }, [dialogManager, setEditingEquipment]);

  const openAddEquipmentModal = useCallback(
    (type: EquipmentTypeEnum) => {
      setEditingEquipment(null);
      setAddEquipmentType(type);
    },
    [setAddEquipmentType, setEditingEquipment]
  );

  const handleAddEquipmentSubmit = useCallback(
    async (payload: AddEquipmentSubmitPayload) => {
      let succeeded = false;

      if (payload.type === EquipmentTypeEnum.MACHINE) {
        succeeded = await handleAddMachine(payload.data);
      } else if (payload.type === EquipmentTypeEnum.VEHICLE) {
        succeeded = await handleAddVehicle(payload.data);
      } else {
        succeeded = await handleAddTrailer(payload.data);
      }

      if (succeeded) {
        setAddEquipmentType(null);
      }
    },
    [handleAddMachine, handleAddTrailer, handleAddVehicle, setAddEquipmentType]
  );

  const isAddEquipmentSubmitting =
    createMachine.isPending ||
    createVehicle.isPending ||
    createTrailer.isPending ||
    updateMachine.isPending ||
    updateVehicle.isPending ||
    updateTrailer.isPending;

  const handleEditEquipment = useCallback(
    async (equipment: EquipmentPageData) => {
      setEditingEquipment(equipment);
      const equipmentType =
        normalizeEquipmentType(equipment.equipment_type) ??
        EquipmentTypeEnum.MACHINE;

      if (equipmentType === EquipmentTypeEnum.MACHINE) {
        const MachineForm = await loadMachineForm();
        dialogManager.openDialog({
          type: "editMachineForm",
          component: MachineForm,
          props: {
            initialData: equipment as MachinePageData,
            onCancel: closeEquipmentDialog,
            onSubmit: handleEditMachineSubmit,
          },
        });
        return;
      }

      if (equipmentType === EquipmentTypeEnum.VEHICLE) {
        const VehicleForm = await loadVehicleForm();
        dialogManager.openDialog({
          type: "editVehicleForm",
          component: VehicleForm,
          props: {
            initialData: equipment as VehiclePageData,
            onCancel: closeEquipmentDialog,
            onSubmit: handleEditVehicleSubmit,
          },
        });
        return;
      }

      const TrailerForm = await loadTrailerForm();
      dialogManager.openDialog({
        type: "editTrailerForm",
        component: TrailerForm,
        props: {
          initialData: equipment as TrailerPageData,
          isEditMode: true,
          onCancel: closeEquipmentDialog,
          onSubmit: handleEditTrailerSubmit,
        },
      });
    },
    [
      closeEquipmentDialog,
      dialogManager,
      handleEditMachineSubmit,
      handleEditTrailerSubmit,
      handleEditVehicleSubmit,
      setEditingEquipment,
    ]
  );

  useEffect(() => {
    const equipmentId = searchParams.get("equipment_id");
    const editMode = searchParams.get("edit");

    if (
      !orgId ||
      !equipmentId ||
      editMode !== "true" ||
      equipmentData.length === 0
    ) {
      return;
    }

    const equipment = equipmentData.find(
      (item) => String(item.id) === equipmentId
    );
    if (!equipment) return;

    handleEditEquipment(equipment);
    router.replace(orgPath(orgId, APP_ROUTES.equipment), { scroll: false });
  }, [equipmentData, handleEditEquipment, orgId, router, searchParams]);

  const handleSortRulesChange = useCallback(
    (rules: TableSortRule[]) => {
      setSortRules(rules.slice(0, 1));
    },
    [setSortRules]
  );

  const handleViewChange = useCallback(
    (view: TableViewMode) => {
      setView(view as NotKanbanView);
    },
    [setView]
  );

  const tableSortRules = useMemo(
    () => sortOrderToEquipmentSortRules(sortOrder),
    [sortOrder]
  );

  return (
    <PageRenderer
      renderChildrenWhenEmpty
      data={equipmentData}
      description="View and manage your equipment inventory here."
      emptyState={{
        title: "No equipment found",
        description: "Try adjusting your search or filters to find equipment.",
      }}
      error={
        equipmentQuery.isError ? new Error("Failed to load equipment") : null
      }
      isLoading={false}
      loadingMessage="Loading equipment..."
      title="Equipment"
    >
      {() => {
        if (!canViewEquipment) {
          return (
            <AccessDeniedView message="You do not have permission to view equipment." />
          );
        }

        return (
          <div className="flex min-h-0 flex-1 flex-col">
            <EquipmentTable
              canDeleteEquipment={!!canDeleteEquipment}
              canEditEquipment={!!canEditEquipment}
              canViewEquipment={!!canViewEquipment}
              data={equipmentData}
              filterValues={filterValues}
              isLoading={equipmentQuery.isLoading || equipmentQuery.isFetching}
              pagination={pagination}
              search={searchConfig}
              selectable={!!canDeleteEquipment}
              selectedIds={selectedIds}
              sortRules={tableSortRules}
              view={currentView as TableViewMode}
              onAdd={openAddEquipmentModal}
              onBulkDelete={handleBulkDelete}
              onDelete={handleDeleteEquipment}
              onFilterValuesChange={setFilterValues}
              onLogs={handleEquipmentLogs}
              onSelectChange={setSelectedIds}
              onSortRulesChange={handleSortRulesChange}
              onView={handleViewEquipment}
              onViewChange={handleViewChange}
            />
            <DialogManager manager={dialogManager} />
            {addEquipmentType ? (
              <AddEquipmentModal
                equipmentType={addEquipmentType}
                isSubmitting={isAddEquipmentSubmitting}
                open={addEquipmentType !== null}
                onOpenChange={(open) => {
                  if (!open) setAddEquipmentType(null);
                }}
                onSubmit={handleAddEquipmentSubmit}
              />
            ) : null}
          </div>
        );
      }}
    </PageRenderer>
  );
}
