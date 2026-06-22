"use client";

import { User } from "lucide-react";

import { JobType, LeadType, MapViewTab } from "@/constants/enums";
import { getIconByNumber } from "@/shared/ui/common/map";

interface MapLegendEntry {
  color?: string;
  icon_svg?: string;
}

interface MapLegendData {
  lead?: MapLegendEntry;
  job?: MapLegendEntry;
}

interface MapLegendProps {
  activeTab: MapViewTab;
  isMobile: boolean;
  getLegendData: (type: string) => MapLegendData | null;
  onLegendClick: () => void;
}

export const MapLegend = ({
  activeTab,
  isMobile,
  getLegendData,
  onLegendClick,
}: MapLegendProps) => {
  if (activeTab === MapViewTab.CONTACTS) {
    // Contact legend
    return isMobile ? (
      <div className="absolute bottom-4 left-1/2 z-10 flex min-h-[28px] w-auto max-w-[95vw] -translate-x-1/2 flex-row items-center gap-2 rounded-lg bg-black/70 p-3 shadow">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-black">
          <User className="h-3 w-3 text-white" />
        </span>
        <span className="text-xs font-medium text-white">Contacts</span>
      </div>
    ) : (
      <div className="absolute bottom-4 left-4 z-10 flex w-auto min-w-[200px] flex-row items-center gap-2 rounded-lg bg-black/70 p-4 shadow">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-black">
          <User className="h-4 w-4 text-white" />
        </span>
        <span className="text-base font-medium text-white">Contacts</span>
      </div>
    );
  }

  // Jobs & Leads legend
  return isMobile ? (
    <div
      className="absolute bottom-4 left-1/2 z-10 flex w-auto max-w-[95vw] -translate-x-1/2 cursor-pointer flex-row items-center rounded-lg bg-black/70 p-3 shadow transition-colors hover:bg-black/80"
      title="Click to customize legend"
      onClick={onLegendClick}
    >
      {/* Leads column */}
      <div className="flex flex-col gap-1.5 pr-3">
        {Object.values(JobType).map((type) => {
          const legendData = getLegendData(type);
          const leadLegend = legendData?.lead;

          // Use default values if no legend data
          const leadColor = leadLegend?.color || "#ef4444";
          const leadIconNumber = leadLegend?.icon_svg || "1";
          const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

          return (
            <div
              key={`${type}-lead`}
              className="flex min-h-[28px] items-center gap-2"
            >
              <span
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: leadColor }}
              >
                {getIconByNumber(type, leadIconNumber)}
              </span>
              <span className="text-xs font-medium text-white">
                {typeLabel} Lead
              </span>
            </div>
          );
        })}
      </div>
      {/* Divider */}
      <div className="mx-2 h-[90px] flex-shrink-0 border-l border-white/50" />
      {/* Jobs column */}
      <div className="flex flex-col gap-1.5 pl-1">
        {Object.values(JobType).map((type) => {
          const legendData = getLegendData(type);
          const jobLegend = legendData?.job;

          // Use default values if no legend data
          const jobColor = jobLegend?.color || "#3b82f6";
          const jobIconNumber = jobLegend?.icon_svg || "1";
          const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

          return (
            <div
              key={`${type}-job`}
              className="flex min-h-[28px] items-center gap-2"
            >
              <span
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: jobColor }}
              >
                {getIconByNumber(type, jobIconNumber)}
              </span>
              <span className="text-xs font-medium text-white">
                {typeLabel} Job
              </span>
            </div>
          );
        })}
      </div>
    </div>
  ) : (
    <div
      className="absolute bottom-4 left-4 z-10 flex w-auto min-w-[340px] cursor-pointer flex-row items-center rounded-lg bg-black/70 p-4 shadow transition-colors hover:bg-black/80"
      title="Click to customize legend"
      onClick={onLegendClick}
    >
      {/* Leads column */}
      <div className="flex flex-col gap-3 pr-6">
        {Object.values(LeadType).map((type) => {
          const legendData = getLegendData(type);
          const leadLegend = legendData?.lead;

          // Use default values if no legend data
          const leadColor = leadLegend?.color || "#ef4444";
          const leadIconNumber = leadLegend?.icon_svg || "1";
          const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

          return (
            <div key={`${type}-lead`} className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: leadColor }}
              >
                {getIconByNumber(type, leadIconNumber)}
              </span>
              <span className="text-base font-medium text-white">
                {typeLabel} Lead
              </span>
            </div>
          );
        })}
      </div>
      {/* Divider */}
      <div className="mx-4 h-[72px] border-l border-white/50" />
      {/* Jobs column */}
      <div className="flex flex-col gap-3 pl-2">
        {Object.values(JobType).map((type) => {
          const legendData = getLegendData(type);
          const jobLegend = legendData?.job;

          // Use default values if no legend data
          const jobColor = jobLegend?.color || "#3b82f6";
          const jobIconNumber = jobLegend?.icon_svg || "1";
          const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

          return (
            <div key={`${type}-job`} className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: jobColor }}
              >
                {getIconByNumber(type, jobIconNumber)}
              </span>
              <span className="text-base font-medium text-white">
                {typeLabel} Job
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
