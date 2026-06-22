import { FC } from "react";

import { Wrench } from "lucide-react";

import { useUnitSystem } from "@/hooks";
import { SanitizedInput } from "@/shared/ui/primitives";

interface FilterCardProps {
  title: string;
  name: string;
  value: {
    last_changed: number | "";
    threshold: number | "";
    filter_number: string | "";
    automatic: boolean;
  };
  onChange: (val: {
    last_changed: number | "";
    threshold: number | "";
    filter_number: string | "";
    automatic: boolean;
  }) => void;
  currentHours?: number;
  vehicle?: boolean;
  /** When true, card border is red (one of Last changed / Threshold filled without the other) */
  hasError?: boolean;
}

const FilterCard: FC<FilterCardProps> = ({
  title,
  value,
  onChange,
  currentHours,
  vehicle = false,
  hasError = false,
}) => {
  const unitSystem = useUnitSystem();
  const isMetric = unitSystem === "metric";
  const vehicleUnitLabel = isMetric ? "Kilometers" : "Miles";
  const vehicleUnitShort = isMetric ? "kilometers" : "miles";
  const isDueForMaintenance = () => {
    if (currentHours && value.threshold && value.last_changed !== "") {
      return (
        currentHours >= Number(value.last_changed) + Number(value.threshold)
      );
    }
    return false;
  };
  const borderClass = hasError
    ? "border-2 border-feedback-error"
    : isDueForMaintenance()
      ? "border-feedback-error"
      : "border-border-subtle";
  return (
    <div
      className={`bg-bg-surface-elevated text-text-primary flex max-w-[320px] min-w-[260px] flex-col gap-2 rounded-xl border p-5 shadow-sm ${borderClass}`}
    >
      <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
        <Wrench className="text-text-muted h-5 w-5" />
        <span>{title}</span>
        {isDueForMaintenance() && (
          <span className="bg-feedback-error text-text-inverse rounded-full px-2 py-0.5 text-xs">
            Due
          </span>
        )}
      </div>
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-full flex-col items-start justify-end gap-2">
          <label className="mb-1 block text-sm font-medium">
            {vehicle
              ? `Last Changed (${vehicleUnitLabel})`
              : "Last Changed (Hours)"}
          </label>
          <span className="text-text-muted text-[10px]">
            must be less than or equal to current{" "}
            {vehicle ? vehicleUnitShort : "hours"}
          </span>

          <SanitizedInput
            className="border-border-subtle bg-bg-app text-text-primary w-full rounded border px-3 py-2"
            max={currentHours}
            min={0}
            placeholder="Last Changed..."
            type="number"
            value={value.last_changed}
            onChange={(e) =>
              onChange({
                ...value,
                last_changed:
                  e.target.value === "" ? "" : Number(e.target.value),
                automatic: value.automatic || true,
              })
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {vehicle ? `Threshold (${vehicleUnitLabel})` : "Threshold (Hours)"}
          </label>
          <SanitizedInput
            className="border-border-subtle bg-bg-app text-text-primary w-full rounded border px-3 py-2"
            min={0}
            placeholder="Threshold"
            type="number"
            value={value.threshold}
            onChange={(e) =>
              onChange({
                ...value,
                threshold: e.target.value === "" ? "" : Number(e.target.value),
                automatic: value.automatic || true,
              })
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Filter Number{" "}
            <span className="text-text-muted text-xs">(Optional)</span>
          </label>
          <SanitizedInput
            className="border-border-subtle bg-bg-app text-text-primary w-full rounded border px-3 py-2"
            placeholder="e.g. FF-3289R"
            type="text"
            value={value.filter_number}
            onChange={(e) =>
              onChange({
                ...value,
                filter_number: e.target.value,
                automatic: value.automatic || true,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default FilterCard;
