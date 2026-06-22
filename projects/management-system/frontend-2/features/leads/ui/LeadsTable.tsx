"use client";

import { useCallback, useMemo } from "react";

import {
  Button,
  type TableBulkAction,
  type TableFilterDefinition,
  type TableFilterValue,
  type TableGridViewConfig,
  type TablePaginationConfig,
  type TableSearchConfig,
  type TableSortRule,
  type TableViewMode,
} from "@fieldflow360/org-ui";
import { Archive, ListTree, PlusCircle, Trash2, Undo2 } from "lucide-react";

import type { DesignRequestStatus, Status, TeamMember } from "@/api/types";
import {
  type JobLeadArchiveTab,
  LeadType,
  type NotKanbanView,
  ViewMode,
} from "@/constants";
import {
  JobLeadTable,
  filterStateToTableValues,
  tableValuesToFilterState,
  toNumericIds,
} from "@/features/job-lead";
import {
  type LeadOrgUiColumnHandlers,
  LeadTableRow,
  getLeadOrgUiColumns,
} from "@/features/leads/lib/columns";
import { LeadGridCard } from "@/features/leads/ui/LeadGridCard";
import { FilterState, FilterType } from "@/shared/ui/common";

export interface LeadsTableProps {
  data: LeadTableRow[];
  isLoading?: boolean;
  pagination?: TablePaginationConfig;
  organizationId?: string | number | null;
  search: TableSearchConfig;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  sortRules: TableSortRule[];
  onSortRulesChange: (rules: TableSortRule[]) => void;
  view: NotKanbanView;
  onViewChange: (view: NotKanbanView) => void;
  selectedIds: (string | number)[];
  onSelectChange: (ids: (string | number)[]) => void;
  currentTab: JobLeadArchiveTab;
  leadType: LeadType;
  leadTypes: Status[];
  leadStatuses: Status[];
  teamData?: TeamMember[];
  canEdit: boolean;
  canEditSettings: boolean;
  onAddLead: () => void;
  onAddLeadType: () => void;
  onShowMore: (id: number, isArchived?: boolean) => void;
  onLogs?: (id: number, isArchived?: boolean) => void;
  onTrash: (id: number) => void;
  onUnarchive: (id: number) => void;
  onArchive: (id: number) => void;
  onTrashSelectedLeads: (leadIds: number[]) => void;
  onArchiveSelectedLeads: (leadIds: number[]) => void;
  onUnarchiveSelectedLeads: (leadIds: number[]) => void;
  designRequestStatusMap?: Map<number, DesignRequestStatus>;
}

const LEAD_SORTABLE_COLUMNS = [
  { key: "customer_name", label: "Lead Name" },
  { key: "last_updated", label: "Last Updated" },
] as const;

export function LeadsTable({
  data,
  isLoading,
  pagination,
  organizationId,
  search,
  filters,
  onFilterChange,
  sortRules,
  onSortRulesChange,
  view,
  onViewChange,
  selectedIds,
  onSelectChange,
  currentTab,
  leadType,
  leadTypes,
  leadStatuses,
  teamData,
  canEdit,
  canEditSettings,
  onAddLead,
  onAddLeadType,
  onShowMore,
  onLogs,
  onTrash,
  onUnarchive,
  onArchive,
  onTrashSelectedLeads,
  onArchiveSelectedLeads,
  onUnarchiveSelectedLeads,
  designRequestStatusMap,
}: LeadsTableProps) {
  const isArchived = currentTab === "archived";
  const readOnly = !canEdit;

  const columnHandlers = useMemo(
    (): LeadOrgUiColumnHandlers => ({
      leadType,
      readOnly,
      isArchived,
      leadStatuses,
      leadTypes,
      teamData,
      getDesignRequestStatus: designRequestStatusMap
        ? (leadId) => designRequestStatusMap.get(leadId)
        : undefined,
      onShowMore,
      onLogs,
      onTrash,
      onUnarchive,
      onArchive,
    }),
    [
      designRequestStatusMap,
      isArchived,
      leadType,
      leadStatuses,
      leadTypes,
      onArchive,
      onLogs,
      onShowMore,
      onTrash,
      onUnarchive,
      readOnly,
      teamData,
    ]
  );

  const allColumns = useMemo(
    () => getLeadOrgUiColumns(columnHandlers),
    [columnHandlers]
  );

  const filterDefinitions = useMemo(
    (): TableFilterDefinition[] => [
      {
        id: FilterType.LEAD_TYPES,
        label: "Source",
        options: leadTypes.map((type) => ({
          value: String(type.id),
          label: type.title,
        })),
      },
      {
        id: FilterType.LEAD_STATUSES,
        label: "Status",
        options: leadStatuses.map((status) => ({
          value: String(status.id),
          label: status.title,
        })),
      },
    ],
    [leadStatuses, leadTypes]
  );

  const filterValues = useMemo(
    () => filterStateToTableValues(filters),
    [filters]
  );

  const handleFilterValuesChange = useCallback(
    (values: TableFilterValue[]) => {
      onFilterChange(tableValuesToFilterState<FilterState>(values));
    },
    [onFilterChange]
  );

  const handleViewChange = useCallback(
    (nextView: TableViewMode) => {
      if (nextView === ViewMode.KANBAN) return;
      onViewChange(nextView as NotKanbanView);
    },
    [onViewChange]
  );

  const bulkActions = useMemo((): TableBulkAction[] => {
    if (!canEdit) return [];

    if (isArchived) {
      return [
        {
          id: "trash-selected",
          label: "Trash Selected",
          icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
          variant: "danger",
          onClick: (ids) => onTrashSelectedLeads(toNumericIds(ids)),
        },
        {
          id: "unarchive-selected",
          label: "Unarchive Selected",
          icon: <Undo2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
          onClick: (ids) => onUnarchiveSelectedLeads(toNumericIds(ids)),
        },
      ];
    }

    return [
      {
        id: "trash-selected",
        label: "Trash Selected",
        icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
        variant: "danger",
        onClick: (ids) => onTrashSelectedLeads(toNumericIds(ids)),
      },
      {
        id: "archive-selected",
        label: "Archive Selected",
        icon: <Archive aria-hidden className="h-4 w-4" strokeWidth={2} />,
        onClick: (ids) => onArchiveSelectedLeads(toNumericIds(ids)),
      },
    ];
  }, [
    canEdit,
    isArchived,
    onArchiveSelectedLeads,
    onTrashSelectedLeads,
    onUnarchiveSelectedLeads,
  ]);

  const renderCollectionCard = useCallback(
    (
      lead: LeadTableRow,
      context: {
        selected: boolean;
        onSelectedChange: (selected: boolean) => void;
      }
    ) => (
      <LeadGridCard
        handlers={columnHandlers}
        lead={lead}
        leadStatuses={leadStatuses}
        leadTypes={leadTypes}
        selectable={canEdit}
        selected={context.selected}
        teamData={teamData}
        onDoubleClick={() => onShowMore(lead.id, isArchived)}
        onSelectedChange={context.onSelectedChange}
      />
    ),
    [
      canEdit,
      columnHandlers,
      isArchived,
      leadStatuses,
      leadTypes,
      onShowMore,
      teamData,
    ]
  );

  const grid = useMemo(
    (): TableGridViewConfig<LeadTableRow> => ({
      renderCard: renderCollectionCard,
      minColumnWidth: "minmax(18rem, 1fr)",
    }),
    [renderCollectionCard]
  );

  const toolbarActions = (
    <div className="flex shrink-0 items-center gap-2">
      {canEdit ? (
        <Button
          leftIcon={<PlusCircle aria-hidden className="h-4 w-4" />}
          title="Add Lead"
          onClick={onAddLead}
        />
      ) : null}
      {canEditSettings ? (
        <Button
          leftIcon={<ListTree aria-hidden className="h-4 w-4" />}
          title="Add Lead Source"
          onClick={onAddLeadType}
        />
      ) : null}
    </div>
  );

  const resolvedView = view;

  return (
    <JobLeadTable
      bulkActions={bulkActions}
      columns={allColumns}
      data={data}
      emptyState={{
        title: "No leads found",
        description: isArchived
          ? "No archived leads found."
          : "Try adjusting your search or filters to find leads.",
      }}
      filterDefinitions={filterDefinitions}
      filterValues={filterValues}
      grid={grid}
      isLoading={isLoading}
      organizationId={organizationId}
      pagination={pagination}
      search={search}
      selectable={canEdit}
      selectedIds={selectedIds}
      sortableColumns={[...LEAD_SORTABLE_COLUMNS]}
      sortRules={sortRules}
      storageKeyPrefix="leads"
      toolbarActions={toolbarActions}
      view={resolvedView}
      onFilterValuesChange={handleFilterValuesChange}
      onSelectChange={onSelectChange}
      onSortRulesChange={onSortRulesChange}
      onViewChange={handleViewChange}
    />
  );
}
