"use client";

import type { ReactNode } from "react";

import { Textarea } from "@fieldflow360/org-ui";

import type { QuickActionFarmSelectOption, QuickActionFile } from "@/api/types";

import { QuickActionFarmTable } from "./QuickActionFarmTable";
import { QuickActionFileRow } from "./QuickActionFileRow";

/**
 * Generic form shell shared by all three convert flows (contact / lead / job).
 *
 * - `children`           — type-specific controls rendered at the top of the form.
 * - `files`              — when provided, shows the Files section.
 * - `farms`              — when provided together with selectedFarmIds / onToggleFarm, shows the Farm table.
 * - `description`        — when provided together with onDescriptionChange, shows the Description textarea.
 */
export function QuickActionConvertBase({
  children,
  files,
  farms,
  selectedFarmId,
  onSelectFarm,
  description,
  onDescriptionChange,
}: {
  children?: ReactNode;
  files?: QuickActionFile[];
  farms?: QuickActionFarmSelectOption[];
  selectedFarmId?: number;
  onSelectFarm?: (farmId: number) => void;
  description?: string;
  onDescriptionChange?: (value: string) => void;
}) {
  const showDescription =
    description !== undefined && onDescriptionChange !== undefined;
  const showFiles = files !== undefined;
  const showFarms = farms !== undefined && onSelectFarm !== undefined;

  return (
    <div className="space-y-6">
      {children ? <div className="space-y-4">{children}</div> : null}

      {showDescription && (
        <Textarea
          className="min-h-[80px]"
          label="Description"
          maxLength={500}
          placeholder="Description"
          value={description}
          onChange={(e) => onDescriptionChange!(e.target.value)}
        />
      )}

      {showFiles && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Files</p>
            <span className="text-text-muted text-xs">
              {files!.length} file(s)
            </span>
          </div>
          {files!.length === 0 ? (
            <p className="text-text-muted bg-bg-surface/30 rounded-md border py-3 text-center text-sm">
              No files
            </p>
          ) : (
            <div className="space-y-2">
              {files!.map((file) => (
                <QuickActionFileRow key={file.id} file={file} />
              ))}
            </div>
          )}
        </div>
      )}

      {showFarms ? (
        <QuickActionFarmTable
          farms={farms!}
          selectedFarmId={selectedFarmId!}
          onSelectFarm={onSelectFarm!}
        />
      ) : null}
    </div>
  );
}
