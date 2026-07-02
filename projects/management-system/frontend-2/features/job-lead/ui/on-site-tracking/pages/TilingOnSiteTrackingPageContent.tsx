"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AppFormModal,
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Input,
  Loader,
} from "@fieldflow360/org-ui";
import { useQueryClient } from "@tanstack/react-query";
import type { Cell, Column, Worksheet } from "exceljs";
import { saveAs } from "file-saver";
import { Download, PlusCircle } from "lucide-react";

import type { FootageExcelData, FootageJobData } from "@/api/types";
import {
  JobType,
  PermissionCode,
  WALL_TYPE_LABELS,
  WallType,
} from "@/constants";
import { InstalledFootageLogsSection } from "@/features/installed-footage-logs";
import {
  JobMaintenanceStatusSection,
  JobOnSiteEquipmentSection,
  JobOnSiteMapSection,
  JobOnSiteNotesFloating,
  JobOnSiteTimeTrackingSection,
  JobOnSiteTrackingPageLayout,
} from "@/features/job-lead";
import type { JobOnSiteMapJob } from "@/features/job-lead/ui/on-site-tracking/JobOnSiteMapSection";
import type { EntityDataState } from "@/features/job-lead/ui/show-more-card/entityDataState";
import { JobEquipmentAssignment } from "@/features/jobs";
import DailyProgressPopUp from "@/features/jobs/ui/tiling/DailyProgressPopUp";
import {
  useFootageMutations,
  useJobStatusHandler,
  useOrganizationById,
  useOrganizationStatuses,
  useRouteIds,
} from "@/hooks";
import {
  useContactPermissions,
  useJobPermissions,
  useJobProgressPermissions,
} from "@/hooks/permissions";
import { INSTALLED_FOOTAGE_LOGS_QUERY_KEY, useJobById } from "@/hooks/queries";
import axiosInstance from "@/lib/axios";
import { orgUrl } from "@/shared/config/routes";
import { loadExceljs } from "@/shared/lib/excel/load-exceljs";
import { DetailFormSection } from "@/shared/ui/common";
import { PermissionCodeGate } from "@/shared/ui/permissions";
import { calculateMainFootageTotal } from "@/utils/footageCalculations";

export default function OnSiteTrackingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params.id as string;
  const isArchived = searchParams.get("archived") === "true";
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useJobById(
    jobId,
    JobType.TILING,
    isArchived,
    false
  );
  const { data: statusTypes } = useOrganizationStatuses({ jobType: "T" });
  const [jobData, setJobData] = useState(job);
  const { orgId } = useRouteIds();
  const { data: organizationData, refetch: refetchOrganization } =
    useOrganizationById(orgId);

  const {
    addDailyProgressLateral,
    addDailyProgresMain,
    addDailyProgressRaisers,
    getExcelFile,
    getFootagePage,
  } = useFootageMutations();
  const { canEditStatus } = useJobPermissions(JobType.TILING);
  const {
    canUpdateInstalledFootage,
    canUpdateInstalledRisers,
    canViewInstalledFootage,
  } = useJobProgressPermissions(jobId, JobType.TILING);
  const { canRead: canReadContact } = useContactPermissions();

  const notesTabAccess = jobData?.notesTabAccess;

  const [showFootageForm, setShowFootageForm] = useState(false);
  const [isLateral, setIsLateral] = useState(false);
  const [isMain, setIsMain] = useState(false);
  const [installedformData, setInstalledformData] = useState<{
    footage: string;
    pipeSize: string;
    wallType: WallType;
  }>({
    footage: "",
    pipeSize: "",
    wallType: WallType.SINGLE_WALL,
  });
  const [footageData, setFootageData] = useState<FootageJobData | null>(null);
  const [showRaisersForm, setShowRaisersForm] = useState(false);
  const [raisersCount, setRaisersCount] = useState<string>("");
  const [raisersDate, setRaisersDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (job) {
      setJobData(job);
    }
  }, [job]);

  useEffect(() => {
    if (jobData?.id) {
      getFootagePage.mutate(jobData.id, {
        onSuccess: (data) => {
          setFootageData(data);
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobData?.id]);

  const { toggleArchive, completedJob, cancelled, handleStatusChange } =
    useJobStatusHandler({
      job: jobData,
      jobType: JobType.TILING,
      statusTypes,
      jobId,
      isArchived,
    });

  function handleUpdateLateralFootage(data: { footage: number; date: string }) {
    if (!jobData?.id) {
      return;
    }
    addDailyProgressLateral.mutate(
      {
        data: { footage: String(data.footage), date: data.date },
        jobId: jobData.id,
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: [INSTALLED_FOOTAGE_LOGS_QUERY_KEY],
          });
          getFootagePage.mutate(jobData.id, {
            onSuccess: (data) => {
              setFootageData(data);
            },
          });
        },
      }
    );
  }

  function handleUpdateMainFootage(data: {
    footage: number;
    date: string;
    size: string;
    pipe_wall_type: WallType;
  }) {
    if (!jobData?.id) {
      return;
    }
    addDailyProgresMain.mutate(
      {
        data: {
          footage: data.footage,
          date: data.date,
          size: data.size,
          pipe_wall_type: data.pipe_wall_type,
        },
        jobId: jobData.id,
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: [INSTALLED_FOOTAGE_LOGS_QUERY_KEY],
          });
          getFootagePage.mutate(jobData.id, {
            onSuccess: (data) => {
              setFootageData(data);
            },
          });
        },
      }
    );
  }

  function handleGetExcelFile(jobId: number) {
    if (!jobId) return;

    getExcelFile.mutate(
      { jobId },
      {
        onSuccess: async (data) => {
          // Get job name from the data
          const jobName =
            jobData?.title || jobData?.contact_info?.full_name || "Unknown_Job";
          const orgName = organizationData?.name || "Organization";
          const fileName = `${orgName}_${jobName}.xlsx`;

          const { Workbook } = await loadExceljs();
          const workbook = new Workbook();
          const worksheet = workbook.addWorksheet("Installation Report");

          // Company logo
          const logoRow = worksheet.addRow([]);
          logoRow.height = 80;

          // Create title cells
          worksheet.mergeCells("A1:A3");
          worksheet.mergeCells("D1:G3");

          // Refetch organization data to get fresh logo URL with retry logic
          let freshOrgData;
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              const result = await refetchOrganization();
              freshOrgData = result.data;

              // If we got the data and it has a logo, break
              if (freshOrgData && freshOrgData.logo) {
                break;
              }

              retryCount++;
              if (retryCount < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
              }
            } catch (error) {
              console.error("Error fetching organization data:", error);
              retryCount++;
              if (retryCount >= maxRetries) {
                console.warn(
                  "Failed to fetch organization data after retries, proceeding without logo"
                );
                break;
              }
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }

          // Try to add logo if available
          if (freshOrgData?.logo) {
            try {
              const response = await fetch(freshOrgData.logo);
              if (response.ok) {
                const blob = await response.blob();

                return new Promise((resolve, reject) => {
                  const reader = new FileReader();

                  reader.onload = async () => {
                    try {
                      const base64data = reader.result as string;
                      const base64Data = base64data.split("base64,")[1];

                      const imageId = workbook.addImage({
                        base64: base64Data,
                        extension: "jpeg",
                      });

                      worksheet.addImage(imageId, "A1:A3");

                      // Generate Excel content after logo is added
                      await generateExcelContent(worksheet, data);

                      // Generate the Excel file
                      const buffer = await workbook.xlsx.writeBuffer();
                      const newBlob = new Blob([buffer], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      });
                      saveAs(newBlob, fileName);
                      resolve(undefined);
                    } catch (error) {
                      reject(error);
                      console.error("Error processing image:", error);
                      // Fall back to generating content without logo
                      await generateExcelContent(worksheet, data);
                      const buffer = await workbook.xlsx.writeBuffer();
                      const newBlob = new Blob([buffer], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      });
                      saveAs(newBlob, fileName);
                      resolve(undefined);
                    }
                  };

                  reader.onerror = (error) => {
                    console.error("Error reading file:", error);
                    // Fall back to generating content without logo
                    generateExcelContent(worksheet, data).then(async () => {
                      const buffer = await workbook.xlsx.writeBuffer();
                      const newBlob = new Blob([buffer], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      });
                      saveAs(newBlob, fileName);
                      resolve(undefined);
                    });
                  };

                  reader.readAsDataURL(blob);
                });
              } else {
                throw new Error(
                  `Failed to fetch image: ${response.statusText}`
                );
              }
            } catch (error) {
              console.error("Error loading logo:", error);
              // Continue with Excel generation without the logo
              await generateExcelContent(worksheet, data);
              const buffer = await workbook.xlsx.writeBuffer();
              const newBlob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              });
              saveAs(newBlob, fileName);
            }
          } else {
            // If no logo, generate the Excel file directly
            await generateExcelContent(worksheet, data);
            const buffer = await workbook.xlsx.writeBuffer();
            const newBlob = new Blob([buffer], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(newBlob, fileName);
          }
        },
        onError: (error) => {
          console.error("Download failed:", error);
        },
      }
    );
  }

  // Helper function to generate Excel content
  async function generateExcelContent(
    worksheet: Worksheet,
    data: FootageExcelData
  ) {
    // Add title
    const titleCell = worksheet.getCell("G1");
    titleCell.value = "Total Footage Installed";
    titleCell.font = {
      size: 20,
      bold: true,
      color: { argb: "FFFFFF" },
    };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "F2A007" },
    };
    titleCell.alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    // Add space
    worksheet.addRow([]);

    // Total Installed Lateral section
    const lateralHeaderRow = worksheet.addRow(["Installed Lateral"]);
    lateralHeaderRow.font = { bold: true, size: 14 };
    lateralHeaderRow.height = 30;
    worksheet.mergeCells(
      `A${lateralHeaderRow.number}:J${lateralHeaderRow.number}`
    );

    // Add table headers
    const lateralTableHeader = worksheet.addRow([
      "Name",
      "Date",
      "Installed Lateral",
    ]);
    lateralTableHeader.height = 30;
    lateralTableHeader.eachCell((cell: Cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F2A007" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    });

    // Process Lateral Progress data
    const lateralData = data.Lateral_Progress || data["Lateral Progress"] || [];
    if (lateralData.length > 1) {
      for (let i = 1; i < lateralData.length; i++) {
        const row = lateralData[i];
        worksheet.addRow([
          row[4],
          new Date(row[2]).toLocaleDateString(),
          row[3],
        ]);
      }
    }

    // Add 3 empty rows for data input if no data
    if (lateralData.length <= 1) {
      for (let i = 0; i < 3; i++) {
        worksheet.addRow(["", "", ""]);
      }
    }

    // Add total row
    const lateralTotalLabelRow = worksheet.addRow([
      "",
      "Total Installed Lateral",
      "",
    ]);
    lateralTotalLabelRow.getCell(2).font = {
      bold: true,
      color: { argb: "FFFFFF" },
    };
    lateralTotalLabelRow.getCell(2).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "F2A007" },
    };
    lateralTotalLabelRow.getCell(2).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    // Calculate lateral total
    let lateralTotal = 0;
    if (lateralData.length > 1) {
      for (let i = 1; i < lateralData.length; i++) {
        lateralTotal += Number(lateralData[i][3]) || 0;
      }
    }
    lateralTotalLabelRow.getCell(3).value = lateralTotal;

    // Add space
    worksheet.addRow([]);

    // Total Installed Main section
    const mainHeaderRow = worksheet.addRow(["Total Installed Main"]);
    mainHeaderRow.font = { bold: true, size: 14 };
    mainHeaderRow.height = 30;
    worksheet.mergeCells(`A${mainHeaderRow.number}:J${mainHeaderRow.number}`);

    // Add table headers
    const mainTableHeader = worksheet.addRow([
      "Name",
      "Date",
      "Wall Type",
      "Size",
      "Installed Main",
    ]);
    mainTableHeader.height = 30;
    mainTableHeader.eachCell((cell: Cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F2A007" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    });

    // Process Main Progress data
    const mainData = data.Main_Progress || data["Main Progress"] || [];
    if (mainData.length > 1) {
      for (let i = 1; i < mainData.length; i++) {
        const row = mainData[i];
        const wallType = row[6] || WallType.SINGLE_WALL;
        const wallTypeLabel =
          WALL_TYPE_LABELS[wallType as WallType] || wallType;
        worksheet.addRow([
          row[5],
          new Date(row[2]).toLocaleDateString(),
          wallTypeLabel,
          row[4],
          row[3],
        ]);
      }
    }

    // Add 3 empty rows for data input if no data
    if (mainData.length <= 1) {
      for (let i = 0; i < 3; i++) {
        worksheet.addRow(["", "", "", "", ""]);
      }
    }

    // Add total row
    const mainTotalLabelRow = worksheet.addRow([
      "",
      "",
      "",
      "Total Installed Main",
      "",
    ]);
    mainTotalLabelRow.getCell(4).font = {
      bold: true,
      color: { argb: "FFFFFF" },
    };
    mainTotalLabelRow.getCell(4).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "F2A007" },
    };
    mainTotalLabelRow.getCell(4).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    // Calculate main total
    let mainTotal = 0;
    if (mainData.length > 1) {
      for (let i = 1; i < mainData.length; i++) {
        mainTotal += Number(mainData[i][3]) || 0;
      }
    }
    mainTotalLabelRow.getCell(5).value = mainTotal;

    // Add space
    worksheet.addRow([]);

    // Raisers Installed section
    const raisersHeaderRow = worksheet.addRow(["Raisers Installed"]);
    raisersHeaderRow.font = { bold: true, size: 14 };
    raisersHeaderRow.height = 30;
    worksheet.mergeCells(
      `A${raisersHeaderRow.number}:J${raisersHeaderRow.number}`
    );

    // Add table headers
    const raisersTableHeader = worksheet.addRow(["Name", "Date", "Quantity"]);
    raisersTableHeader.height = 30;
    raisersTableHeader.eachCell((cell: Cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F2A007" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    });

    // Process Raisers Progress data
    const raisersData = data.Raisers_Progress || data["Raisers Progress"] || [];
    if (raisersData.length > 1) {
      for (let i = 1; i < raisersData.length; i++) {
        const row = raisersData[i];
        worksheet.addRow([
          row[4],
          new Date(row[2]).toLocaleDateString(),
          row[3],
        ]);
      }
    }

    // Add 3 empty rows for data input if no data
    if (raisersData.length <= 1) {
      for (let i = 0; i < 3; i++) {
        worksheet.addRow(["", "", ""]);
      }
    }

    // Add total row
    const raisersTotalLabelRow = worksheet.addRow([
      "",
      "Total Raisers Installed",
      "",
    ]);
    raisersTotalLabelRow.getCell(2).font = {
      bold: true,
      color: { argb: "FFFFFF" },
    };
    raisersTotalLabelRow.getCell(2).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "F2A007" },
    };
    raisersTotalLabelRow.getCell(2).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    // Calculate raisers total
    let raisersTotal = 0;
    if (raisersData.length > 1) {
      for (let i = 1; i < raisersData.length; i++) {
        raisersTotal += Number(raisersData[i][3]) || 0;
      }
    }
    raisersTotalLabelRow.getCell(3).value = raisersTotal;

    // Set column widths
    worksheet.columns.forEach((column: Partial<Column>) => {
      column.width = 20;
    });

    // Add borders to all cells
    for (
      let i = lateralTableHeader.number;
      i <= lateralTotalLabelRow.number - 1;
      i++
    ) {
      const row = worksheet.getRow(i);
      row.eachCell({ includeEmpty: true }, (cell: Cell, colNumber: number) => {
        if (colNumber <= 3) {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      });
    }

    for (
      let i = mainTableHeader.number;
      i <= mainTotalLabelRow.number - 1;
      i++
    ) {
      const row = worksheet.getRow(i);
      row.eachCell({ includeEmpty: true }, (cell: Cell, colNumber: number) => {
        if (colNumber <= 4) {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      });
    }

    for (
      let i = raisersTableHeader.number;
      i <= raisersTotalLabelRow.number - 1;
      i++
    ) {
      const row = worksheet.getRow(i);
      row.eachCell({ includeEmpty: true }, (cell: Cell, colNumber: number) => {
        if (colNumber <= 3) {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      });
    }
  }

  function handleExportTimeTrackingExcel() {
    // TODO: Implement export excel for time tracking
  }

  function handleUpdateRaisers() {
    if (!jobData?.id || !raisersCount || !raisersDate) return;

    const quantity = parseInt(raisersCount);
    if (isNaN(quantity) || quantity <= 0) return;

    addDailyProgressRaisers.mutate(
      {
        data: {
          date: raisersDate,
          quantity: quantity,
        },
        jobId: jobData.id,
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: [INSTALLED_FOOTAGE_LOGS_QUERY_KEY],
          });
          getFootagePage.mutate(jobData.id, {
            onSuccess: (data) => {
              setFootageData(data);
            },
          });

          axiosInstance
            .get(
              `ms/organizations/${orgId}/jobs/drainage_tiling/${jobData.id}/`
            )
            .then((response) => {
              setJobData(response.data);
            });

          setRaisersCount("");
          setRaisersDate(new Date().toISOString().split("T")[0]);
          setShowRaisersForm(false);
        },
        onError: (error) => {
          console.error("Failed to add raisers:", error);
        },
      }
    );
  }

  function refreshInstalledFootageTotals() {
    if (!jobData?.id) return;
    getFootagePage.mutate(jobData.id, {
      onSuccess: (data) => {
        setFootageData(data);
      },
    });
  }

  const detailHref = orgUrl(
    orgId ?? "",
    `/jobs/drainage-tiling/${jobData?.id ?? jobId}`,
    `archived=${isArchived}`
  );

  const sectionDisabled =
    isArchived || toggleArchive || completedJob || cancelled;

  const footageActionsDisabled = sectionDisabled;

  if (isLoading) {
    return (
      <Loader
        className="min-h-[40vh]"
        size={ComponentSizeEnum.SM}
        text="Loading…"
      />
    );
  }

  return (
    <>
      <PermissionCodeGate permissionCode={PermissionCode.JOBS_TILING_PAGE_READ}>
        <JobOnSiteTrackingPageLayout
          canEditStatus={canEditStatus}
          canReadContact={canReadContact}
          contactInfo={jobData?.contact_info ?? null}
          currentStatus={jobData?.job_status}
          detailHref={detailHref}
          jobId={jobId}
          jobType={JobType.TILING}
          orgId={orgId}
          permissionCode={PermissionCode.JOBS_TILING_PAGE_READ}
          poNumber={jobData?.po_number}
          content={
            jobData?.id != null ? (
              <div className="flex flex-col gap-5 lg:gap-6 xl:gap-8">
                {/* Row 1 — field map (left) + time tracking & installed hours (right) */}
                <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2 lg:gap-6 xl:gap-8">
                  <div className="flex min-w-0 flex-col gap-5">
                    <JobOnSiteMapSection
                  canEditCorePoints={!sectionDisabled}
                  canMutatePins={!sectionDisabled}
                  disabled={sectionDisabled}
                  job={jobData as unknown as JobOnSiteMapJob}
                  jobType={JobType.TILING}
                  orgId={orgId}
                  organizationLocation={
                    organizationData?.latitude != null &&
                    organizationData?.longitude != null
                      ? {
                          lat: Number(organizationData.latitude),
                          lng: Number(organizationData.longitude),
                        }
                      : null
                  }
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-5">
                    <JobOnSiteTimeTrackingSection
                      disabled={sectionDisabled}
                      jobId={jobData.id}
                      jobType={JobType.TILING}
                      onExportExcel={handleExportTimeTrackingExcel}
                    />
                  </div>
                </div>
                {/* Row 2: footage installed (left) + installed footage logs (right) */}
                <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-6 xl:gap-8">
                  <div className="flex min-w-0 flex-col gap-5">
                    <DetailFormSection
                      actions={
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-bg-surface text-text-muted rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap">
                        {footageData?.["Total Installed Footage"] || 0} ft total
                      </span>
                      <Button
                        disabled={footageActionsDisabled}
                        leftIcon={
                          <Download
                            aria-hidden
                            className="h-4 w-4"
                            strokeWidth={2}
                          />
                        }
                        title="Export Excel"
                        variant={ButtonVariantEnum.SURFACE}
                        onClick={() => handleGetExcelFile(jobData.id)}
                      />
                    </div>
                  }
                  title="Footage installed"
                >
                  <div className="flex flex-col gap-4">
                    <div className="border-border-subtle flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                      <div>
                        <p className="text-text-primary text-sm font-semibold">
                          Installed lateral
                        </p>
                        <p className="text-text-muted text-sm">
                          {footageData?.["Total Installed Lateral Footage"] ||
                            0}{" "}
                          ft
                        </p>
                      </div>
                      {canUpdateInstalledFootage ? (
                        <Button
                          disabled={footageActionsDisabled}
                          leftIcon={
                            <PlusCircle
                              aria-hidden
                              className="h-4 w-4"
                              strokeWidth={2}
                            />
                          }
                          title="Add lateral"
                          variant={ButtonVariantEnum.SURFACE}
                          onClick={() => {
                            setIsLateral(true);
                            setIsMain(false);
                            setShowFootageForm(true);
                          }}
                        />
                      ) : null}
                    </div>
                    <div className="border-border-subtle flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                      <div>
                        <p className="text-text-primary text-sm font-semibold">
                          Installed main
                        </p>
                        <p className="text-text-muted text-sm">
                          {calculateMainFootageTotal(footageData)} ft
                        </p>
                      </div>
                      {canUpdateInstalledFootage ? (
                        <Button
                          disabled={footageActionsDisabled}
                          leftIcon={
                            <PlusCircle
                              aria-hidden
                              className="h-4 w-4"
                              strokeWidth={2}
                            />
                          }
                          title="Add main"
                          variant={ButtonVariantEnum.SURFACE}
                          onClick={() => {
                            setIsLateral(false);
                            setIsMain(true);
                            setShowFootageForm(true);
                          }}
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-text-primary text-sm font-semibold">
                          Raisers installed
                        </p>
                        <p className="text-text-muted text-sm">
                          {footageData?.["Total Installed Raisers"] || 0}
                        </p>
                      </div>
                      {canUpdateInstalledRisers ? (
                        <Button
                          disabled={footageActionsDisabled}
                          leftIcon={
                            <PlusCircle
                              aria-hidden
                              className="h-4 w-4"
                              strokeWidth={2}
                            />
                          }
                          title="Add raisers"
                          variant={ButtonVariantEnum.SURFACE}
                          onClick={() => setShowRaisersForm(true)}
                        />
                      ) : null}
                    </div>
                  </div>
                    </DetailFormSection>
                  </div>
                  <div className="flex min-w-0 flex-col gap-5">
                    {canViewInstalledFootage ? (
                      <InstalledFootageLogsSection
                        canUpdateInstalledFootage={canUpdateInstalledFootage}
                        canUpdateInstalledRaisers={canUpdateInstalledRisers}
                        disabled={sectionDisabled}
                        jobId={jobData.id}
                        onLogsChanged={refreshInstalledFootageTotals}
                      />
                    ) : null}
                  </div>
                </div>
                {/* Row 3: equipment assignment (left) + maintenance status (right) */}
                <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-6 xl:gap-8">
                  <div className="flex min-w-0 flex-col gap-5">
                    <JobOnSiteEquipmentSection>
                      <JobEquipmentAssignment
                        embedded
                        hideMaintenance
                        assignments={jobData.equipments ?? []}
                        disabled={sectionDisabled}
                        farmerJob={
                          jobData.job_object_subclass ===
                          "Drainge_TilingFarmerJob"
                        }
                        jobId={jobData.id}
                        jobType={JobType.TILING}
                        mode="track"
                      />
                    </JobOnSiteEquipmentSection>
                  </div>
                  <div className="flex min-w-0 flex-col gap-5">
                    <JobMaintenanceStatusSection />
                  </div>
                </div>
              </div>
            ) : null
          }
          progressBar={jobData?.progress_bar}
          statusDisabled={sectionDisabled}
          statusTypes={statusTypes}
          onStatusChange={handleStatusChange}
        />
        {jobData?.id != null ? (
          <JobOnSiteNotesFloating
            assignedToJob={jobData?.canAccessOnSiteTracking === true}
            canEdit={!sectionDisabled}
            entity={jobData as unknown as EntityDataState}
            isTrashed={isArchived}
            jobId={jobId}
            jobType={JobType.TILING}
            notesTabAccess={notesTabAccess}
            readOnly={sectionDisabled}
          />
        ) : null}
      </PermissionCodeGate>

      {showFootageForm && (
        <DailyProgressPopUp
          card={{ data: [] }}
          handleUpdateLateralFootage={handleUpdateLateralFootage}
          handleUpdateMainFootage={handleUpdateMainFootage}
          installedformData={installedformData}
          isLateral={isLateral}
          isMain={isMain}
          setFormData={() => {}}
          setInstalledformData={setInstalledformData}
          setShowFootageForm={setShowFootageForm}
        />
      )}

      <AppFormModal
        showCancel
        isOpen={showRaisersForm}
        submitDisabled={
          !raisersCount ||
          !raisersDate ||
          Number.isNaN(parseInt(raisersCount, 10)) ||
          parseInt(raisersCount, 10) <= 0
        }
        submitLabel="Add"
        title="Add raisers"
        width={480}
        onClose={() => {
          setShowRaisersForm(false);
          setRaisersCount("");
          setRaisersDate(new Date().toISOString().split("T")[0]);
        }}
        onSubmit={(event) => {
          event.preventDefault();
          handleUpdateRaisers();
        }}
      >
        <div className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={raisersDate}
            onChange={(e) => setRaisersDate(e.target.value)}
          />
          <Input
            label="Number of raisers"
            min={1}
            placeholder="Enter count"
            step={1}
            type="number"
            value={raisersCount}
            onChange={(e) => setRaisersCount(e.target.value)}
          />
        </div>
      </AppFormModal>
    </>
  );
}
