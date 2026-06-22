"use client";

import { useEffect, useMemo, useState } from "react";

import {
  FieldFlowRadialChart,
  type FieldFlowRadialChartDatum,
  Modal,
  TabsSwitcher,
  getChartSeriesColor,
} from "@fieldflow360/org-ui";

import type { FootageJobData, FormattedFootageData } from "@/api/types";
import {
  type FootageChartTab,
  buildFootageLateralChartLegend,
  buildFootageMainChartLegend,
  buildSummaryLateralChartLegend,
  buildSummaryMainChartLegend,
  getFootageJobTitle,
  getFootageMainChartTitle,
} from "@/features/footage";

export type FootageChartsSource =
  | { type: "job"; job: FootageJobData }
  | { type: "summary"; rows: FormattedFootageData[] };

export interface FootageChartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: FootageChartsSource;
}

function sumLegend(legend: Record<string, number>): number {
  return Object.values(legend).reduce((sum, value) => sum + value, 0);
}

function formatFootageValue(value: number): string {
  return `${value.toLocaleString()} ft`;
}

function legendToRadialData(
  legend: Record<string, number>
): FieldFlowRadialChartDatum[] {
  return Object.entries(legend).map(([label, value], index) => ({
    id: label.toLowerCase().replace(/\s+/g, "-"),
    label,
    value,
    color: getChartSeriesColor(index),
  }));
}

function FootageTotalRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-bg-app border-border-subtle flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
      <span className="text-text-muted text-sm font-medium">{label}</span>
      <span className="text-text-primary text-xl font-bold tabular-nums sm:text-2xl">
        {formatFootageValue(value)}
      </span>
    </div>
  );
}

function getModalTitle(source: FootageChartsSource): string {
  if (source.type === "job") {
    return getFootageJobTitle(source.job);
  }
  return "Footage statistics";
}

function getModalSubtitle(source: FootageChartsSource): string | null {
  if (source.type === "summary") {
    const count = source.rows.length;
    return count === 1
      ? "Totals for 1 job matching your filters"
      : `Totals for ${count} jobs matching your filters`;
  }
  return "Installed footage for this job";
}

export function FootageChartsModal({
  isOpen,
  onClose,
  source,
}: FootageChartsModalProps) {
  const [mainChartTab, setMainChartTab] = useState<FootageChartTab>("all");

  useEffect(() => {
    if (isOpen) {
      setMainChartTab("all");
    }
  }, [isOpen, source]);

  const lateralLegend = useMemo(() => {
    if (source.type === "job") {
      return buildFootageLateralChartLegend(source.job);
    }
    return buildSummaryLateralChartLegend(source.rows);
  }, [source]);

  const mainLegend = useMemo(() => {
    if (source.type === "job") {
      return buildFootageMainChartLegend(source.job, mainChartTab);
    }
    return buildSummaryMainChartLegend(source.rows, mainChartTab);
  }, [source, mainChartTab]);

  const lateralTotal = useMemo(() => sumLegend(lateralLegend), [lateralLegend]);
  const mainTotal = useMemo(() => sumLegend(mainLegend), [mainLegend]);
  const mainRadialData = useMemo(
    () => legendToRadialData(mainLegend),
    [mainLegend]
  );

  const mainChartTitle = getFootageMainChartTitle(mainChartTab);
  const subtitle = getModalSubtitle(source);

  return (
    <Modal
      className="mx-4 w-full max-w-3xl"
      isOpen={isOpen}
      size="lg"
      title={getModalTitle(source)}
      onClose={onClose}
    >
      <div className="flex flex-col gap-5 pb-2">
        {subtitle ? (
          <p className="text-text-muted text-center text-sm">{subtitle}</p>
        ) : null}

        <FootageTotalRow label="Total Lateral Footage" value={lateralTotal} />

        <TabsSwitcher
          items={[
            { value: "all", label: "All" },
            { value: "single_wall", label: "Single Wall" },
            { value: "dual_wall", label: "Dual Wall" },
          ]}
          value={mainChartTab}
          onChange={(value) => setMainChartTab(value as FootageChartTab)}
        />

        <div className="border-border-subtle bg-bg-surface-elevated flex flex-col gap-4 rounded-xl border p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-text-primary text-sm font-semibold">
              {mainChartTitle}
            </h3>
            <span className="text-text-primary text-lg font-bold tabular-nums">
              {formatFootageValue(mainTotal)}
            </span>
          </div>
          <FieldFlowRadialChart
            showLegend
            centerLabel={{
              value: mainTotal.toLocaleString(),
              subtitle: "ft",
            }}
            data={mainRadialData}
            emptyDescription="Data will appear here once it is available."
            emptyTitle="No data"
            height={280}
            legendScrollable={false}
            valueFormatter={(value) => formatFootageValue(value)}
          />
        </div>
      </div>
    </Modal>
  );
}
