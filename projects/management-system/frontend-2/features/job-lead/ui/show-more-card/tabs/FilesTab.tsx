"use client";

import { type ReactNode, useCallback, useMemo } from "react";

import { JobType, PermissionCode } from "@/constants";
import { Ff360DesignsFilesPanel } from "@/features/design-request";
import { getJobLeadRecordBreadcrumbLabel } from "@/features/job-lead";
import { useRouteIds } from "@/hooks";
import {
  collectKmlMaps,
  collectShpMaps,
  collectXmlMaps,
  getMapFileDisplayName,
} from "@/shared/lib/mapFilesV2";
import {
  DetailFormSection,
  FileCard,
  FilesDragDropZone,
  MapFileCard,
  UploadFileDropdown,
} from "@/shared/ui/common";
import { PermissionCodeGate } from "@/shared/ui/permissions";

import { TabRendererProps } from "../types";

interface FilesTabFile {
  id: number;
  title: string;
  file: string;
}

interface FileCategoryPanelProps {
  title: string;
  files: FilesTabFile[];
  checkedFiles: number[];
  disabled: boolean;
  jobTitle?: string;
  formatDisplayTitle: (title: string) => string;
  onCheck?: (index: number) => void;
  onDelete?: (id: number, title: string) => void;
}

function FileCategoryPanel({
  title,
  files,
  checkedFiles,
  disabled,
  jobTitle,
  formatDisplayTitle,
  onCheck,
  onDelete,
}: FileCategoryPanelProps) {
  return (
    <div className="border-border-subtle bg-bg-surface flex min-w-0 flex-col gap-3 rounded-xl border p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-text-primary text-sm font-semibold">{title}</h3>
        <span className="text-text-muted bg-bg-app rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums">
          {files.length}
        </span>
      </div>
      {files.length === 0 ? (
        <p className="text-text-muted text-sm">No files yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {files.map((file, idx) => (
            <FileCard
              key={file.id}
              checked={checkedFiles.includes(idx)}
              disabled={disabled}
              file={{
                ...file,
                displayTitle: formatDisplayTitle(file.title),
                url: file.file,
              }}
              jobTitle={jobTitle}
              onCheck={() => onCheck?.(idx)}
              onDelete={() => onDelete?.(file.id, file.title)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FilesTab(props: TabRendererProps) {
  const {
    config,
    entityType,
    entityDataState,
    isDisabled,
    filteredFiles,
    uploading = false,
    checkedFiles = [],
    canEdit,
    farmerEntity,
    jobPageReadPermissionCode,
    leadPageReadPermissionCode,
    handleFileDelete,
    handleCheck,
    setSelectedFileType,
    setSelectedFileName,
    setIsFixedTitle,
    setShowUploadFile,
    handleInlineFileSelect,
  } = props;

  const { orgId } = useRouteIds();
  const isTiling = config.jobType === JobType.TILING;
  const jobTitle =
    getJobLeadRecordBreadcrumbLabel(
      entityDataState.contact_info,
      entityDataState.farm_info?.name
    ) ??
    entityDataState.title ??
    "—";

  const ff360Entity = useMemo(
    () => ({
      organizationName: "",
      clientName: entityDataState.contact_info?.full_name ?? "",
      farmName: entityDataState.farm_info?.name ?? "",
      jobTitle,
      requestedByName: "",
    }),
    [
      entityDataState.contact_info?.full_name,
      entityDataState.farm_info?.name,
      jobTitle,
    ]
  );

  const filesByCategory = filteredFiles ?? {
    farmer: [],
    contractor: [],
    one_call: [],
    designer: [],
    special: [],
  };

  const hasMapSpecialFiles =
    config.fileTypes.special?.some(
      (s) => typeof s === "object" && s.uploadType === "map"
    ) ?? false;

  const useTilingStyleUploadDropdown =
    config.jobType === JobType.TILING ||
    (hasMapSpecialFiles &&
      (config.jobType === JobType.REPAIR ||
        config.jobType === JobType.EXCAVATION));

  const handleMapFileDelete = (id: number, type: string) => {
    handleFileDelete?.(id, type);
  };

  const handleFileTypeSelect = useCallback(
    ({
      fileType,
      fileName,
      isFixedTitle,
    }: {
      fileType: string;
      fileName: string;
      isFixedTitle: boolean;
    }) => {
      setSelectedFileType?.(fileType);
      setSelectedFileName?.(fileName);
      setIsFixedTitle?.(isFixedTitle);
      setShowUploadFile?.(true);
    },
    [
      setSelectedFileType,
      setSelectedFileName,
      setIsFixedTitle,
      setShowUploadFile,
    ]
  );

  const uploadControl = useMemo((): ReactNode => {
    if (!canEdit) return null;

    const dropdown = (
      <UploadFileDropdown
        disabled={isDisabled}
        entityType={entityType}
        fileTypesConfig={
          config.fileTypes as {
            special?: import("../types").SpecialFileType[];
            regular?: string[];
          }
        }
        jobType={config.jobType}
        uploading={uploading}
        onFileTypeSelect={handleFileTypeSelect}
      />
    );

    if (useTilingStyleUploadDropdown) {
      return dropdown;
    }

    return (
      <PermissionCodeGate
        permissionCodes={
          [
            jobPageReadPermissionCode,
            leadPageReadPermissionCode,
            PermissionCode.JOBS_REPAIR_PAGE_READ,
          ] as PermissionCode[]
        }
      >
        {dropdown}
      </PermissionCodeGate>
    );
  }, [
    canEdit,
    config.fileTypes,
    config.jobType,
    entityType,
    isDisabled,
    jobPageReadPermissionCode,
    leadPageReadPermissionCode,
    uploading,
    useTilingStyleUploadDropdown,
    handleFileTypeSelect,
  ]);

  const specialMapFiles = filesByCategory.special.filter(
    (file: FilesTabFile) => {
      const title = file.title?.toLowerCase() || "";
      return title.includes("design_file") || title.includes("delivered_file");
    }
  );

  const showMapFilesSection =
    config.fileTypes.special &&
    (collectXmlMaps(entityDataState).length > 0 ||
      collectShpMaps(entityDataState).length > 0 ||
      collectKmlMaps(entityDataState).length > 0 ||
      specialMapFiles.length > 0);

  const xmlMaps = collectXmlMaps(entityDataState);
  const shpMaps = collectShpMaps(entityDataState);
  const kmlMaps = collectKmlMaps(entityDataState);

  return (
    <div className="mx-auto flex w-full flex-col gap-5">
      <DetailFormSection
        actions={uploadControl}
        description="Upload and manage files for this record."
        title="Files & documents"
      >
        {canEdit ? (
          <FilesDragDropZone
            disabled={isDisabled}
            uploading={uploading}
            onFileSelect={(file) => handleInlineFileSelect?.(file)}
          />
        ) : null}
        {showMapFilesSection ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {xmlMaps.map((mapFile, index) => (
              <MapFileCard
                key={`xml-${mapFile.id}`}
                disabled={isDisabled}
                fileId={mapFile.id}
                fileName={getMapFileDisplayName(
                  mapFile.file,
                  xmlMaps.length > 1 ? `XML File ${index + 1}` : "XML File"
                )}
                fileType="xml_file"
                fileUrl={mapFile.file}
                onDelete={handleMapFileDelete}
              />
            ))}
            {shpMaps.map((mapFile, index) => (
              <MapFileCard
                key={`shp-${mapFile.id}`}
                disabled={isDisabled}
                fileId={mapFile.id}
                fileName={getMapFileDisplayName(
                  mapFile.file,
                  shpMaps.length > 1 ? `Shape File ${index + 1}` : "Shape File"
                )}
                fileType="shape_file"
                fileUrl={mapFile.file}
                onDelete={handleMapFileDelete}
              />
            ))}
            {kmlMaps.map((mapFile, index) => (
              <MapFileCard
                key={`kml-${mapFile.id}`}
                disabled={isDisabled}
                fileId={mapFile.id}
                fileName={getMapFileDisplayName(
                  mapFile.file,
                  kmlMaps.length > 1 ? `KML File ${index + 1}` : "KML File"
                )}
                fileType="kml_file"
                fileUrl={mapFile.file}
                onDelete={handleMapFileDelete}
              />
            ))}
            {specialMapFiles.map((file: FilesTabFile) => (
              <MapFileCard
                key={file.id}
                canView={
                  (file.file && /\.(pdf|jpg|jpeg|png|gif)$/i.test(file.file)) ||
                  false
                }
                disabled={isDisabled}
                fileId={file.id}
                fileName={
                  file.title.includes("design_file")
                    ? "Design File"
                    : file.title.includes("delivered_file")
                      ? "Delivered File"
                      : "Special File"
                }
                fileType={file.title}
                fileUrl={file.file}
                onDelete={handleMapFileDelete}
              />
            ))}
          </div>
        ) : null}
      </DetailFormSection>

      <div
        className={`grid grid-cols-1 items-start gap-5 sm:grid-cols-2 ${
          isTiling ? "xl:grid-cols-3 2xl:grid-cols-4" : "xl:grid-cols-3"
        }`}
      >
        {isTiling && orgId && entityDataState.id != null ? (
          <Ff360DesignsFilesPanel
            enabled
            entity={ff360Entity}
            entityId={entityDataState.id}
            entityType={entityType}
            organizationId={orgId}
          />
        ) : null}
        {farmerEntity ? (
          <FileCategoryPanel
            checkedFiles={checkedFiles}
            disabled={isDisabled}
            files={filesByCategory.farmer}
            formatDisplayTitle={(title) => title.replace(/^farmer_/, "")}
            jobTitle={entityDataState.title}
            title="Farmer files"
            onCheck={handleCheck}
            onDelete={handleFileDelete}
          />
        ) : null}
        <FileCategoryPanel
          checkedFiles={checkedFiles}
          disabled={isDisabled}
          files={filesByCategory.contractor}
          formatDisplayTitle={(title) =>
            title.replace(/^other_file_/, "").replace(/^_contractor_qa_/, "")
          }
          jobTitle={entityDataState.title}
          title="Contractor files"
          onCheck={handleCheck}
          onDelete={handleFileDelete}
        />
        <FileCategoryPanel
          checkedFiles={checkedFiles}
          disabled={isDisabled}
          files={filesByCategory.one_call}
          formatDisplayTitle={(title) => title.replace(/^one_call_file_/, "")}
          jobTitle={entityDataState.title}
          title="One call files"
          onCheck={handleCheck}
          onDelete={handleFileDelete}
        />
        {filesByCategory.designer.length > 0 ? (
          <FileCategoryPanel
            checkedFiles={checkedFiles}
            disabled={isDisabled}
            files={filesByCategory.designer}
            formatDisplayTitle={(title) =>
              title.replace(/^(design|pro_map)_file_/, "")
            }
            jobTitle={entityDataState.title}
            title="Designer files"
            onCheck={handleCheck}
            onDelete={handleFileDelete}
          />
        ) : null}
      </div>
    </div>
  );
}
