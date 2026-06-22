"use client";

import { Radio } from "@fieldflow360/org-ui";
import { format } from "date-fns";

import type { QuickActionFarmSelectOption } from "@/api/types";

export function QuickActionFarmTable({
  farms,
  selectedFarmId,
  onSelectFarm,
}: {
  farms: QuickActionFarmSelectOption[];
  selectedFarmId?: number;
  onSelectFarm: (farmId: number) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Farm Information</h3>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-surface/50 border-b">
              <th className="w-10 px-3 py-2 text-left font-medium"></th>
              <th className="px-3 py-2 text-left font-medium">Farm Name</th>
              <th className="px-3 py-2 text-left font-medium">Created at</th>
            </tr>
          </thead>
          <tbody>
            {farms.length === 0 ? (
              <tr>
                <td
                  className="text-text-muted px-3 py-6 text-center"
                  colSpan={3}
                >
                  No farms for this contact
                </td>
              </tr>
            ) : (
              farms.map((farm) => (
                <tr
                  key={farm.id}
                  className="hover:bg-bg-surface/30 border-b last:border-b-0"
                >
                  <td className="px-3 py-2">
                    <Radio
                      aria-label={`Select ${farm.name}`}
                      checked={selectedFarmId === farm.id}
                      name="qa-farm"
                      onChange={() => onSelectFarm(farm.id)}
                    />
                  </td>
                  <td className="px-3 py-2 font-medium">{farm.name}</td>
                  <td className="text-text-muted px-3 py-2">
                    {farm.created_at
                      ? format(new Date(farm.created_at), "M/d/yyyy")
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
