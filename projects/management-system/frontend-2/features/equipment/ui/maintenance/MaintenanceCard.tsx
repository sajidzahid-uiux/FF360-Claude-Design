import { FC } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { Edit2, Filter as FilterIcon, Trash2 } from "lucide-react";

import { DISTANCE_UNITS } from "@/constants";
import { useUnitSystem } from "@/hooks";
import { TouchSlideText } from "@/shared/ui/common";
import { SanitizedInput } from "@/shared/ui/primitives";

interface MaintenanceCardProps {
  title: string;
  lastChanged: string | number;
  threshold: string | number;
  countdown: string | number;
  maintenanceRequired: boolean;
  filterNumber?: string | null;
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onChange?: (
    field: "lastChanged" | "threshold" | "filterNumber",
    value: string
  ) => void;
  currentHours: number;
  onDelete?: () => void;
  vehicle?: boolean;
  disabled?: boolean;
  canWrite?: boolean;
}

// Helper function to truncate and handle scrolling text for maintenance titles
const TruncatedTitle = ({ title }: { title: string }) => {
  const isLongTitle = title.length > 20;

  if (!isLongTitle) {
    return (
      <span className="max-w-[120px] truncate text-sm font-bold sm:max-w-[180px] sm:text-lg">
        {title}
      </span>
    );
  }

  return (
    <div className="max-w-[120px] overflow-hidden whitespace-nowrap sm:max-w-[180px]">
      <TouchSlideText
        className="text-sm font-bold sm:text-lg"
        maxWidth="max-w-[120px] sm:max-w-[180px]"
        text={title}
      />
    </div>
  );
};

const MaintenanceCard: FC<MaintenanceCardProps> = ({
  title,
  lastChanged,
  threshold,
  countdown,
  maintenanceRequired,
  filterNumber,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
  onChange,
  currentHours,
  onDelete,
  vehicle = false,
  disabled = false,
  canWrite = true,
}) => {
  const unitSystem = useUnitSystem();
  const vehicleUnitShort = DISTANCE_UNITS.LONG[unitSystem];
  return (
    <div className="border-border-subtle bg-bg-surface-elevated text-text-primary relative flex w-full max-w-full min-w-0 flex-col gap-2 overflow-hidden rounded-xl border p-3 shadow-sm sm:max-w-[320px] sm:p-4 lg:p-5">
      {/* Title row */}
      <div className="mb-2 flex items-center justify-between overflow-hidden">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          <FilterIcon className="text-text-muted h-5 w-5 flex-shrink-0" />
          <TruncatedTitle title={title} />
        </div>
        <div className="ml-2 flex flex-shrink-0 gap-1">
          {canWrite && (
            <>
              {onDelete && (
                <Button
                  iconOnly
                  aria-label="Delete filter"
                  disabled={disabled}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  size={ComponentSizeEnum.SM}
                  variant={ButtonVariantEnum.GHOST}
                  onClick={onDelete}
                />
              )}
              {onEdit && !isEditing && (
                <button
                  aria-label="Edit filter"
                  className="text-text-muted hover:text-accent flex h-8 w-8 items-center justify-center rounded p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={disabled}
                  type="button"
                  onClick={onEdit}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="border-border-subtle mb-2 border-b" />
      {/* Fields */}
      <div className="flex flex-col gap-2 overflow-hidden">
        <div className="flex flex-col gap-1 overflow-hidden sm:flex-row sm:items-center sm:gap-2">
          <span className="text-text-muted block text-sm font-medium sm:min-w-[110px]">
            Filter Number:
          </span>
          {isEditing ? (
            <SanitizedInput
              className="border-border-subtle bg-bg-app focus:ring-accent w-full rounded-full border px-3 py-1 text-center text-base font-medium focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-[150px]"
              disabled={disabled}
              placeholder="e.g. FF-3289R"
              type="text"
              unstyled={true}
              value={filterNumber || ""}
              onChange={(e) => {
                if (onChange) {
                  onChange("filterNumber", e.target.value);
                }
              }}
            />
          ) : (
            <div className="bg-bg-surface border-border-subtle inline-flex min-h-[36px] w-full items-center justify-center rounded-full border px-3 py-1 text-center text-base font-medium sm:w-[150px]">
              <TouchSlideText
                className="text-center"
                maxWidth="max-w-full sm:max-w-[150px]"
                text={filterNumber || "N/A"}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 overflow-hidden sm:flex-row sm:items-center sm:gap-2">
          <span className="text-text-muted block text-sm font-medium sm:min-w-[110px]">
            Last Changed:
          </span>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <SanitizedInput
                autoFocus
                className="border-border-subtle bg-bg-app focus:ring-accent w-20 rounded-full border px-3 py-1 text-center text-base font-medium focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-24"
                disabled={disabled}
                max={currentHours}
                type="number"
                unstyled={true}
                value={lastChanged}
                onChange={(e) => {
                  if (onChange) {
                    const value = e.target.value;
                    if (Number(value) <= currentHours) {
                      onChange("lastChanged", value);
                    }
                  }
                }}
              />
            ) : (
              <span className="bg-bg-surface border-border-subtle w-20 rounded-full border px-3 py-1 text-center text-base font-medium sm:w-24">
                {lastChanged}
              </span>
            )}
            <span className="text-text-muted text-sm">
              {vehicle ? vehicleUnitShort : "hrs"}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 overflow-hidden sm:flex-row sm:items-center sm:gap-2">
          <span className="text-text-muted block text-sm font-medium sm:min-w-[110px]">
            Threshold:
          </span>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <SanitizedInput
                className="border-border-subtle bg-bg-app focus:ring-accent w-20 rounded-full border px-3 py-1 text-center text-base font-medium focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-24"
                disabled={disabled}
                min={0}
                type="number"
                unstyled={true}
                value={threshold}
                onChange={(e) =>
                  onChange && onChange("threshold", e.target.value)
                }
              />
            ) : (
              <span className="bg-bg-surface border-border-subtle w-20 rounded-full border px-3 py-1 text-center text-base font-medium sm:w-24">
                {threshold}
              </span>
            )}
            <span className="text-text-muted text-sm">
              {vehicle ? vehicleUnitShort : "hrs"}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 overflow-hidden sm:flex-row sm:items-center sm:gap-2">
          <span className="text-text-muted block text-sm font-medium sm:min-w-[110px]">
            Countdown:
          </span>
          <span
            className={`font-mono text-base ${
              Number(countdown) < 0 ? "text-feedback-error" : ""
            }`}
          >
            {countdown} {vehicle ? vehicleUnitShort : "hrs"}
          </span>
        </div>
        <div className="flex flex-col gap-1 overflow-hidden sm:flex-row sm:items-center sm:gap-2">
          <span className="text-text-muted block text-sm font-medium sm:min-w-[110px]">
            Maintenance Required:
          </span>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              maintenanceRequired
                ? "bg-feedback-error-soft text-feedback-error border-feedback-error border"
                : "border border-green-300 bg-green-100 text-green-700"
            } whitespace-nowrap`}
          >
            {maintenanceRequired ? "Yes (auto)" : "No (auto)"}
          </span>
        </div>
        {isEditing && (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <button
              className="bg-accent w-full rounded px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              disabled={disabled}
              onClick={onSave}
            >
              Save
            </button>
            <button
              className="bg-bg-surface text-text-primary w-full rounded border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              disabled={disabled}
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceCard;
