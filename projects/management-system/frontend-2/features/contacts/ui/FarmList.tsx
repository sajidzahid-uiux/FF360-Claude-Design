"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Button,
  type Column,
  TableDataModeEnum,
  TableHeaderLabel,
  TableToolbar,
  TableVariantEnum,
  useTablePreferences,
} from "@fieldflow360/org-ui";
import { Calendar, Plus, Sprout } from "lucide-react";

import type { Farm } from "@/api/types";
import { FarmActions } from "@/features/contacts/lib/columns";
import {
  ON_SITE_OPERATIONS_LABEL,
  ON_SITE_OPERATION_LABEL,
} from "@/features/contacts/model/constants";
import { useDialogManager, useFarm, useFarmMutations, useFarms } from "@/hooks";
import {
  PERMISSION_RESOURCES,
  usePermissionsFromStorage,
} from "@/hooks/permissions";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { CmsOrgUiTable } from "@/shared/ui";
import { DialogManager } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";
import { Badge } from "@/shared/ui/primitives";

import FarmDialog from "./FarmDialog";

interface FarmListProps {
  contactId: number;
  autoOpenDialog?: boolean;
}

export default function FarmList({
  contactId,
  autoOpenDialog = false,
}: FarmListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dialogManager = useDialogManager();
  const { openConfirmationDialog } = dialogManager;
  const { stack, openModal, closeModalKey } = useModalStack();
  const [searchTerm, setSearchTerm] = useState("");
  const hasAutoOpenedAddFarmRef = useRef(false);

  const isAddFarmOpen = stack.some((f) => f.key === "add-farm");
  const editFarmFrame = stack.find((f) => f.key === "edit-farm");
  const editingFarmId = editFarmFrame
    ? Number(editFarmFrame.params.id)
    : null;

  const { permissionCodes } = usePermissionsFromStorage(
    PERMISSION_RESOURCES.CONTACT_FARM_TAB
  );

  const hasReadPermission = permissionCodes.includes("read");
  const hasWritePermission = permissionCodes.includes("write");

  const { farms, isLoading, isError } = useFarms(contactId);
  const { remove: deleteFarm } = useFarmMutations(contactId);
  const deleteFarmAsync = deleteFarm.mutateAsync;

  const clearAddFarmActionFromUrl = useCallback(() => {
    if (searchParams.get("action") !== "add") return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router, searchParams]);

  // Filter farms based on search term (client-side)
  const filteredFarms = useMemo(() => {
    if (!farms) return [];
    if (!searchTerm.trim()) return farms;

    return farms.filter((farm) =>
      farm.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [farms, searchTerm]);

  // Get farmId from URL parameters
  const farmIdParam = searchParams.get("farmId");
  const farmId = farmIdParam ? parseInt(farmIdParam) : null;

  // Fetch specific farm if farmId is provided
  const { data: specificFarm, isLoading: isSpecificFarmLoading } = useFarm(
    contactId,
    farmId || 0
  );

  const editingFarm = useMemo<Farm | null>(() => {
    if (editingFarmId === null) return null;
    const fromList = farms?.find((f) => f.id === editingFarmId);
    if (fromList) return fromList;
    if (specificFarm && specificFarm.id === editingFarmId) return specificFarm;
    return null;
  }, [editingFarmId, farms, specificFarm]);

  const showDialog = isAddFarmOpen || editFarmFrame !== undefined;

  const closeFarmDialog = useCallback(() => {
    closeModalKey("add-farm");
    closeModalKey("edit-farm");
    clearAddFarmActionFromUrl();
  }, [clearAddFarmActionFromUrl, closeModalKey]);

  // Auto-open dialog when autoOpenDialog prop is true or when farmId is provided
  useEffect(() => {
    if (autoOpenDialog) {
      if (hasAutoOpenedAddFarmRef.current) return;
      hasAutoOpenedAddFarmRef.current = true;
      openModal("add-farm");
      return;
    }

    hasAutoOpenedAddFarmRef.current = false;

    if (farmId && specificFarm && !isSpecificFarmLoading) {
      // Only auto-open if we're specifically on a farm detail page, not when creating jobs/leads
      const currentPath = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const action = searchParams.get("action");

      // Don't auto-open if we're creating jobs or leads
      if (action === "add" || action === "create") {
        return;
      }

      // Only auto-open if we're on a farm-specific page
      if (currentPath.includes("/contact/") && currentPath.includes("/farm/")) {
        openModal("edit-farm", { id: String(specificFarm.id) });
      }
    }
  }, [autoOpenDialog, farmId, specificFarm, isSpecificFarmLoading, openModal]);

  const handleEditFarm = useCallback(
    (farm: Farm) => {
      openModal("edit-farm", { id: String(farm.id) });
    },
    [openModal]
  );

  const handleDeleteFarm = useCallback(
    (farm: Farm) => {
      openConfirmationDialog({
        title: `Delete ${ON_SITE_OPERATION_LABEL}`,
        confirmationType: "delete",
        itemTitle: farm.name,
        variant: "destructive",
        onConfirm: async () => {
          await deleteFarmAsync(farm.id);
        },
      });
    },
    [deleteFarmAsync, openConfirmationDialog]
  );

  const farmColumns = useMemo(
    (): Column<Farm>[] => [
      {
        key: "name",
        label: `${ON_SITE_OPERATION_LABEL} Name`,
        sortable: true,
        header: (
          <TableHeaderLabel
            truncate
            icon={Sprout}
            label={`${ON_SITE_OPERATION_LABEL} Name`}
          />
        ),
        render: (farm) => <span className="font-medium">{farm.name}</span>,
      },
      {
        key: "acreage",
        label: "Acreage",
        header: "Acreage",
        render: (farm) => (
          <Badge variant="secondary">{farm.acreage} acres</Badge>
        ),
      },
      {
        key: "created_at",
        label: "Created",
        sortable: true,
        header: <TableHeaderLabel truncate icon={Calendar} label="Created" />,
        render: (farm) => {
          const date = new Date(farm.created_at);
          return Number.isNaN(date.getTime())
            ? "N/A"
            : date.toLocaleDateString();
        },
      },
      {
        key: "actions",
        label: "Actions",
        header: "",
        width: "72px",
        align: "right",
        hideable: false,
        render: (farm) => (
          <FarmActions
            contactId={contactId}
            farm={farm}
            handleDeleteFarm={handleDeleteFarm}
            handleEditFarm={handleEditFarm}
          />
        ),
      },
    ],
    [contactId, handleDeleteFarm, handleEditFarm]
  );

  const tablePreferences = useTablePreferences(farmColumns, {
    storageKey: `contact-farms-table-columns:${contactId}`,
    defaultVariant: TableVariantEnum.PLAIN,
  });

  const toolbarActions = hasWritePermission ? (
    <Button
      leftIcon={<Plus aria-hidden className="h-4 w-4" strokeWidth={2} />}
      title={`Create New ${ON_SITE_OPERATION_LABEL}`}
      onClick={() => openModal("add-farm")}
    />
  ) : null;

  const tableColumns = tablePreferences.applyColumns(farmColumns);

  const sortRules = useMemo(
    () => [{ columnKey: "name", direction: "asc" as const }],
    []
  );

  const search = useMemo(
    () => ({
      value: searchTerm,
      onChange: setSearchTerm,
      placeholder: `Search ${ON_SITE_OPERATIONS_LABEL}...`,
    }),
    [searchTerm]
  );

  if (!hasReadPermission) {
    return (
      <AccessDeniedView
        message={`You do not have permission to view ${ON_SITE_OPERATIONS_LABEL.toLowerCase()}.`}
      />
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-feedback-error">{`Error loading ${ON_SITE_OPERATIONS_LABEL.toLowerCase()}`}</div>
      </div>
    );
  }

  return (
    <>
      <CmsOrgUiTable
        showHeaderWhenEmpty
        columns={tableColumns}
        data={filteredFarms}
        dataMode={TableDataModeEnum.CLIENT}
        emptyState={{
          title: "No farms found",
          description: "Try adjusting your search or add a new farm.",
        }}
        isLoading={isLoading}
        sortRules={sortRules}
        toolbar={
          <TableToolbar
            actions={toolbarActions}
            search={search}
            showViewSwitcher={false}
            sortableColumns={[{ key: "name", label: "Farm Name" }]}
            sortRules={sortRules}
            tableSettings={tablePreferences.tableSettings}
            variant={tablePreferences.variant}
          />
        }
        variant={tablePreferences.variant}
      />

      {/* Farm Dialog */}
      <FarmDialog
        contactId={contactId}
        farm={editingFarm}
        isOpen={showDialog}
        onClose={closeFarmDialog}
        onSuccess={closeFarmDialog}
      />

      <DialogManager manager={dialogManager} />
    </>
  );
}
