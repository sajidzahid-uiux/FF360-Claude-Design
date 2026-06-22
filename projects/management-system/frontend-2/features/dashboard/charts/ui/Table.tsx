"use client";

import { useCallback, useMemo } from "react";

import {
  type Column,
  TableDataModeEnum,
  TableHeaderLabel,
  TableVariantEnum,
  cn,
} from "@fieldflow360/org-ui";
import { Hash, Loader2, User, Users } from "lucide-react";

import type { DashboardDesignNeededRow } from "@/api/types";
import { FARM_MANAGEMENT_CONTACT_LABEL } from "@/features/contacts";
import { useDesignsTableNavigation } from "@/features/dashboard";
import { CmsOrgUiTable } from "@/shared/ui";
import { TouchSlideText } from "@/shared/ui/common";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

const TRUNCATED_CELL_MAX_WIDTH = "max-w-[150px]";

type DesignTableRow = DashboardDesignNeededRow;

function TruncatedTableCellText({ text }: { text: string }) {
  const isLongName = text.length > 30;
  if (!isLongName) {
    return (
      <span className="text-[14px] font-normal sm:text-[16px]">{text}</span>
    );
  }
  return (
    <div
      className={`${TRUNCATED_CELL_MAX_WIDTH} overflow-hidden whitespace-nowrap`}
    >
      <TouchSlideText
        className="text-[14px] font-normal sm:text-[16px]"
        maxWidth={TRUNCATED_CELL_MAX_WIDTH}
        text={text}
      />
    </div>
  );
}

interface DesignsTableProps {
  data: DesignTableRow[];
  className?: string;
}

export default function DesignsTable({
  data = [],
  className,
}: DesignsTableProps) {
  const { navigatingKey, handleNavigate } = useDesignsTableNavigation();

  const tableRows = useMemo(
    (): Array<DesignTableRow & { id: string }> =>
      data.map((row) => ({ ...row, id: row.rowKey })),
    [data]
  );

  const handleRowNavigate = useCallback(
    (row: DesignTableRow) => {
      const rowClickable =
        (row.canNavigate ?? true) && (row.href != null || row.designId != null);
      if (!rowClickable) return;

      void handleNavigate({
        href: row.href,
        designId: row.designId,
        navigationKey: row.rowKey,
      });
    },
    [handleNavigate]
  );

  const columns = useMemo((): Column<DesignTableRow & { id: string }>[] => {
    return [
      {
        key: "customerName",
        label: "Customer Name",
        header: <TableHeaderLabel icon={User} label="Customer Name" />,
        render: (row) => {
          const rowClickable =
            (row.canNavigate ?? true) &&
            (row.href != null || row.designId != null);
          const isNavigating =
            navigatingKey != null && navigatingKey === row.rowKey;

          return (
            <button
              aria-busy={isNavigating || undefined}
              className={cn(
                "text-left",
                rowClickable && "cursor-pointer hover:underline"
              )}
              disabled={!rowClickable || isNavigating}
              type="button"
              onClick={() => handleRowNavigate(row)}
            >
              <TruncatedTableCellText text={row.customerName} />
            </button>
          );
        },
      },
      {
        key: "poNumber",
        label: "PO Number",
        header: <TableHeaderLabel icon={Hash} label="PO Number" />,
        width: "160px",
        render: (row) => {
          const isNavigating =
            navigatingKey != null && navigatingKey === row.rowKey;

          if (isNavigating) {
            return (
              <span className="inline-flex items-center gap-2" role="status">
                <Loader2
                  aria-hidden
                  className="text-text-muted size-4 shrink-0 animate-spin"
                />
                <span className="text-text-muted text-[14px] font-normal sm:text-[16px]">
                  Redirecting…
                </span>
              </span>
            );
          }

          return (
            <span className="text-[14px] font-medium sm:text-[16px]">
              {row.poNumber}
            </span>
          );
        },
      },
      {
        key: "farmManagementContactName",
        label: FARM_MANAGEMENT_CONTACT_LABEL,
        header: (
          <TableHeaderLabel
            icon={Users}
            label={FARM_MANAGEMENT_CONTACT_LABEL}
          />
        ),
        render: (row) => (
          <TruncatedTableCellText
            text={row.farmManagementContactName ?? "N/A"}
          />
        ),
      },
    ];
  }, [handleRowNavigate, navigatingKey]);

  return (
    <Card className={cn("flex h-full w-full flex-col", className)}>
      <CardHeader>
        <CardTitle>
          <p className="text-2xl leading-7 font-semibold sm:text-base">
            Designs Needed by You <br />
            Tile Lead/Job
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden p-0 pt-0">
        <CmsOrgUiTable
          compact
          showHeaderWhenEmpty
          columns={columns}
          data={tableRows}
          dataMode={TableDataModeEnum.CLIENT}
          emptyState={{
            title: "No designs needed",
            description: "No designs needed at the moment",
          }}
          variant={TableVariantEnum.PLAIN}
        />
      </CardContent>
    </Card>
  );
}
