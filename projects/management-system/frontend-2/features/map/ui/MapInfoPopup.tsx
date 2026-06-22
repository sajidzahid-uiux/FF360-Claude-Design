"use client";

import { ReactNode } from "react";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { OverlayView } from "@react-google-maps/api";
import { X } from "lucide-react";

import {
  JobLeadTypeRouteSegment,
  ResourceType,
  apiJobTypeToRouteSegment,
} from "@/constants";
import { FARM_MANAGEMENT_CONTACT_LABEL } from "@/features/contacts";
import { sortMapMarkerFarms } from "@/features/map/lib";
import { orgPath } from "@/shared/config/routes";
import { formatContactWithFarm } from "@/shared/lib/formatContactWithFarm";
import { MarqueeText, TouchSlideText } from "@/shared/ui/common";

import type { MapMarkerData, MapMarkerFarm } from "../model/types";

interface MapInfoPopupProps {
  selectedMarker: MapMarkerData;
  organization: string;
  getPopupIconAndColor: (
    objectType: string,
    jobType?: string,
    leadType?: string,
    iconNumber?: string
  ) => { color: string; icon: ReactNode };
  onClose: () => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-text-muted flex-shrink-0 font-medium">{label}</span>
      <div className="min-w-0 flex-1 text-right">
        <TouchSlideText
          className="text-text-primary font-medium"
          maxWidth="w-full"
          text={value}
        />
      </div>
    </div>
  );
}

function resolveStatus(marker: MapMarkerData): string {
  const status = marker.job_status ?? marker.lead_status;
  return status?.title ?? "No Status";
}

function resolveJobUrl(organization: string, marker: MapMarkerData): string {
  const jobType = (marker.job_type ?? "").replace("_jobs", "");
  const slug =
    apiJobTypeToRouteSegment(jobType) ?? JobLeadTypeRouteSegment.REPAIR;
  return orgPath(organization, `/jobs/${slug}/${marker.id}`);
}

function resolveLeadUrl(organization: string, marker: MapMarkerData): string {
  const leadType = String(marker.lead_type ?? "").replace("_leads", "");
  const slug =
    apiJobTypeToRouteSegment(leadType) ?? JobLeadTypeRouteSegment.REPAIR;
  return orgPath(organization, `/leads/${slug}/${marker.id}`);
}

export function MapInfoPopup({
  selectedMarker,
  organization,
  getPopupIconAndColor,
  onClose,
}: MapInfoPopupProps) {
  const { color, icon } = getPopupIconAndColor(
    selectedMarker.object_type,
    selectedMarker.job_type,
    selectedMarker.lead_type,
    selectedMarker.icon_svg
  );

  const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <OverlayView
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      position={{
        lat: selectedMarker.latitude,
        lng: selectedMarker.longitude,
      }}
    >
      <div
        className="bg-bg-surface-elevated border-accent/40 relative left-1/2 z-1000 w-[340px] -translate-x-1/2 rounded-xl border p-3 shadow-xl sm:left-auto sm:translate-x-0 sm:p-5"
        onClick={stopPropagation}
        onTouchEnd={stopPropagation}
        onTouchStart={stopPropagation}
      >
        <Button
          iconOnly
          aria-label="Close popup"
          className="absolute top-3 right-3 z-10 m-1"
          leftIcon={<X aria-hidden className="h-4 w-4" />}
          variant={ButtonVariantEnum.GHOST}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
        />

        <div className="mb-4 flex items-start gap-3">
          <span
            className="flex flex-shrink-0 items-center justify-center rounded-full"
            style={{ width: 36, height: 36, background: color }}
          >
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <PopupTitle
              organization={organization}
              selectedMarker={selectedMarker}
              stopPropagation={stopPropagation}
            />
          </div>
        </div>

        <div className="border-accent/40 mb-4 border-t border-dotted" />

        <div className="flex flex-col gap-3">
          {selectedMarker.object_type === "contact" ? (
            <ContactInfo marker={selectedMarker} />
          ) : (
            <JobLeadInfo marker={selectedMarker} />
          )}
        </div>
      </div>
    </OverlayView>
  );
}

function PopupTitle({
  selectedMarker,
  organization,
  stopPropagation,
}: {
  selectedMarker: MapMarkerData;
  organization: string;
  stopPropagation: (e: React.SyntheticEvent) => void;
}) {
  const linkClass =
    "text-accent hover:text-accent/80 cursor-pointer hover:underline";

  if (selectedMarker.object_type === "contact") {
    return (
      <a
        className={linkClass}
        href={orgPath(organization, `/contact/${selectedMarker.id}`)}
        rel="noopener noreferrer"
        target="_blank"
        onClick={stopPropagation}
        onTouchEnd={stopPropagation}
        onTouchStart={stopPropagation}
      >
        <TouchSlideText
          className="text-xl font-bold"
          maxWidth="w-full"
          text={selectedMarker.full_name ?? ""}
        />
      </a>
    );
  }

  if (selectedMarker.object_type === ResourceType.JOB) {
    return (
      <a
        className={linkClass}
        href={resolveJobUrl(organization, selectedMarker)}
        rel="noopener noreferrer"
        target="_blank"
        onClick={stopPropagation}
        onTouchEnd={stopPropagation}
        onTouchStart={stopPropagation}
      >
        <MarqueeText
          className="text-xl font-bold"
          duration={10}
          maxWidth="max-w-[250px]"
          text={formatContactWithFarm(
            selectedMarker.title === "N/A" ? "Untitled" : selectedMarker.title,
            selectedMarker.farm_name
          )}
        />
      </a>
    );
  }

  if (selectedMarker.object_type === ResourceType.LEAD) {
    return (
      <a
        className={linkClass}
        href={resolveLeadUrl(organization, selectedMarker)}
        rel="noopener noreferrer"
        target="_blank"
        onClick={stopPropagation}
        onTouchEnd={stopPropagation}
        onTouchStart={stopPropagation}
      >
        <MarqueeText
          className="text-xl font-bold"
          duration={10}
          maxWidth="max-w-[250px]"
          text={formatContactWithFarm(
            selectedMarker.title,
            selectedMarker.farm_name
          )}
        />
      </a>
    );
  }

  return (
    <TouchSlideText
      className="text-text-primary text-xl font-bold"
      maxWidth="w-full"
      text={selectedMarker.title ?? ""}
    />
  );
}

function ContactInfo({ marker }: { marker: MapMarkerData }) {
  const address =
    `${marker.street_address || ""} ${marker.city || ""} ${marker.state || ""}`.trim();
  return (
    <>
      {marker.company_name && (
        <InfoRow label="Company" value={marker.company_name} />
      )}
      <InfoRow label="Phone Number" value={marker.phone_number || "N/A"} />
      {marker.email && <InfoRow label="Email" value={marker.email} />}
      {address && <InfoRow label="Address" value={address} />}
    </>
  );
}

function JobLeadInfo({ marker }: { marker: MapMarkerData }) {
  const projectType =
    marker.project_type != null && String(marker.project_type).trim() !== ""
      ? String(marker.project_type)
      : "—";
  const farms = (() => {
    if (!marker.farms || marker.farms.length === 0) return null;
    if (marker.highlighted_farm_id != null) {
      const match = marker.farms.find(
        (f) => f.farm_id === marker.highlighted_farm_id
      );
      return match ? [match] : sortMapMarkerFarms(marker.farms);
    }
    return sortMapMarkerFarms(marker.farms);
  })();

  return (
    <>
      <InfoRow label="PO Number" value={marker.po_number ?? "N/A"} />
      {farms ? (
        <JobLeadFarmsList
          farmManagementContactName={marker.farm_management_contact_name}
          farms={farms}
        />
      ) : null}
      <InfoRow
        label="Phone Number"
        value={marker.customer_phone_number ?? "N/A"}
      />
      <InfoRow label="Status" value={resolveStatus(marker)} />
      <InfoRow label="Project type" value={projectType} />
    </>
  );
}

function JobLeadFarmsList({
  farms,
  farmManagementContactName,
}: {
  farms: MapMarkerFarm[];
  farmManagementContactName?: string | null;
}) {
  const cardClass = "border-border-subtle bg-bg-surface";
  const trimmedFarmManagementName = farmManagementContactName?.trim() || null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-text-muted flex-shrink-0 font-medium">Farm</span>
      <div className="flex flex-col gap-2">
        {farms.map((farm) => (
          <div
            key={farm.farm_id}
            className={`flex flex-col gap-1.5 rounded-lg border px-3 py-2 ${cardClass}`}
          >
            <div className="flex items-center justify-between gap-2">
              <TouchSlideText
                className="text-text-primary min-w-0 flex-1 font-medium"
                maxWidth="w-full"
                text={farm.farm_name}
              />
              {farm.is_primary ? (
                <span className="bg-accent/15 text-accent border-accent/30 shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold">
                  Primary
                </span>
              ) : null}
            </div>
            {trimmedFarmManagementName ? (
              <div className="flex items-start justify-between gap-2">
                <span className="text-text-muted shrink-0 text-xs font-medium">
                  {FARM_MANAGEMENT_CONTACT_LABEL}
                </span>
                <TouchSlideText
                  className="text-text-primary min-w-0 flex-1 text-right text-xs font-medium"
                  maxWidth="w-full"
                  text={trimmedFarmManagementName}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
