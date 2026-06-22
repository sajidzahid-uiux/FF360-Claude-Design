"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { TableSortRule } from "@fieldflow360/org-ui";
import type { Cell, Column, Worksheet } from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "sonner";

import { FootageService } from "@/api/services";
import type {
  FootageComment,
  FootageExcelData,
  FootageJobData,
  FormattedFootageData,
} from "@/api/types";
import { PermissionCode, SortOrder } from "@/constants/enums";
import {
  FootageBreadcrumbToolbar,
  FootageChartsModal,
  FootageNoteModal,
  FootageTable,
  useCrewFilterOptions,
} from "@/features/footage";
import {
  useAllFootage,
  useFootageMutations,
  useOrganizationById,
  useRouteIds,
} from "@/hooks";
import { useCrewGroupsList, useIsAdmin } from "@/hooks/queries";
import useTeamData from "@/hooks/useTeamData";
import { loadExceljs } from "@/shared/lib/excel/load-exceljs";
import { CMS_DEFAULT_PAGE_SIZE as DEFAULT_PAGE_SIZE } from "@/shared/lib/table";
import { FilterState, PageRenderer } from "@/shared/ui/common";
import { AccessDeniedView, PermissionCodeGate } from "@/shared/ui/permissions";
import { getErrorMessage } from "@/utils/apiError";

export default function InstalledFootagePage() {
  const [data, setData] = useState<FormattedFootageData[]>([]);
  const [selectedJob, setSelectedJob] = useState<FootageJobData | undefined>(
    undefined
  );
  const [noteRow, setNoteRow] = useState<FormattedFootageData | null>(null);
  const [summaryChartsOpen, setSummaryChartsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateSort, setDateSort] = useState<SortOrder>(SortOrder.DESC);
  const [sortRules, setSortRules] = useState<TableSortRule[]>([
    { columnKey: "last_updated", direction: SortOrder.DESC },
  ]);
  const currentPageRef = useRef<number>(1);
  const [, forceUpdate] = useState({});

  const handlePageChange = useCallback((page: number) => {
    currentPageRef.current = page;
    forceUpdate({});
  }, []);

  const handleSortRulesChange = useCallback((rules: TableSortRule[]) => {
    setSortRules(rules);
    const direction =
      rules[0]?.direction === SortOrder.ASC ? SortOrder.ASC : SortOrder.DESC;
    setDateSort(direction);
  }, []);

  const { orgId: organization } = useRouteIds();
  const { data: organizationData, refetch: refetchOrganization } =
    useOrganizationById(organization);
  const isAdmin = useIsAdmin();

  const { data: crewGroups = [] } = useCrewGroupsList();
  const { data: teamMembers = [] } = useTeamData();

  const crewFilterOptions = useCrewFilterOptions(crewGroups, teamMembers);

  const footageListParams = useMemo(
    () => FootageService.buildAllJobsParams(filters, dateSort),
    [filters, dateSort]
  );

  const {
    data: footageData,
    isLoading,
    error,
  } = useAllFootage(footageListParams);

  const {
    getExcelFile,
    getFootagePage,
    addComment,
    getComments,
    updateComment,
  } = useFootageMutations();

  useEffect(() => {
    currentPageRef.current = 1;
    forceUpdate({});
  }, [filters, searchQuery, footageListParams]);

  useEffect(() => {
    if (footageData) {
      setData(footageData);
    }
  }, [footageData]);

  // Job name search is client-only; row order comes from the API (`sort_order`).
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((job) => job.name.toLowerCase().includes(query));
  }, [data, searchQuery]);

  // Fetch job details, then open charts modal
  const handleViewDetails = useCallback(
    (jobId: number) => {
      getFootagePage.mutate(jobId, {
        onSuccess: (jobData) => {
          const originalJobData = footageData?.find(
            (row) => row.job_id === jobId
          );
          setSelectedJob({
            ...jobData,
            contact_info: originalJobData
              ? { id: jobId, full_name: originalJobData.name }
              : jobData.contact_info,
          });
        },
      });
    },
    [footageData, getFootagePage]
  );

  // Update handleShowMore to use handleViewDetails
  const handleShowMore = useCallback(
    (row: FormattedFootageData) => {
      handleViewDetails(row.job_id);
    },
    [handleViewDetails]
  );

  const handleSaveNote = useCallback(
    async (value: string) => {
      if (!noteRow?.job_id || !isAdmin) return;

      const row = noteRow;
      const model =
        row.content_type === "drainage_tilingjob"
          ? "drainage_tilingjob"
          : "drainage_tilingfarmerjob";

      try {
        if (row.note) {
          await new Promise<void>((resolve, reject) => {
            getComments.mutate(
              { jobId: row.job_id, model },
              {
                onSuccess: (comments: FootageComment[]) => {
                  const matchingComment = comments.find(
                    (comment) =>
                      String(comment.object_id) === String(row.job_id)
                  );
                  if (!matchingComment) {
                    reject(new Error("No matching comment found."));
                    return;
                  }
                  updateComment.mutate(
                    {
                      jobId: row.job_id,
                      commentId: matchingComment.id,
                      text: value,
                      model,
                    },
                    {
                      onSuccess: () => resolve(),
                      onError: (error) => reject(error),
                    }
                  );
                },
                onError: (error) => reject(error),
              }
            );
          });
        } else {
          await new Promise<void>((resolve, reject) => {
            addComment.mutate(
              { jobId: row.job_id, text: value, model },
              {
                onSuccess: () => resolve(),
                onError: (error) => reject(error),
              }
            );
          });
        }
        toast.success("Note saved");
        setNoteRow(null);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to save note"));
        throw error;
      }
    },
    [addComment, getComments, isAdmin, noteRow, updateComment]
  );

  const isSavingNote =
    addComment.isPending || updateComment.isPending || getComments.isPending;

  const handleGetExcelFile = useCallback(
    (jobId: number, jobTitle: string) => {
      if (!jobId) return;

      getExcelFile.mutate(
        { jobId },
        {
          onSuccess: async (data) => {
            // Get job name from the data
            const jobName = jobTitle || "Unknown_Job";
            const orgName = organizationData?.name || "Organization";
            const fileName = `${orgName}_${jobName}.xlsx`;

            const ExcelJS = await loadExceljs();
            const workbook = new ExcelJS.Workbook();
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
                console.error("Error loading logo:", error);
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

                  return new Promise<void>((resolve, reject) => {
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
                        resolve();
                      } catch (error) {
                        console.error("Error processing image:", error);
                        reject(error);
                        // Fall back to generating content without logo
                        await generateExcelContent(worksheet, data);
                        const buffer = await workbook.xlsx.writeBuffer();
                        const newBlob = new Blob([buffer], {
                          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        });
                        saveAs(newBlob, fileName);
                        resolve();
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
                        resolve();
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
    },
    [getExcelFile, organizationData?.name, refetchOrganization]
  );

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
          new Date(String(row[2])).toLocaleDateString(),
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
        worksheet.addRow([
          row[5],
          new Date(String(row[2])).toLocaleDateString(),
          row[4],
          row[3],
        ]);
      }
    }

    // Add 3 empty rows for data input if no data
    if (mainData.length <= 1) {
      for (let i = 0; i < 3; i++) {
        worksheet.addRow(["", "", "", ""]);
      }
    }

    // Add total row
    const mainTotalLabelRow = worksheet.addRow([
      "",
      "",
      "Total Installed Main",
      "",
    ]);
    mainTotalLabelRow.getCell(3).font = {
      bold: true,
      color: { argb: "FFFFFF" },
    };
    mainTotalLabelRow.getCell(3).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "F2A007" },
    };
    mainTotalLabelRow.getCell(3).alignment = {
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
    mainTotalLabelRow.getCell(4).value = mainTotal;

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
  }

  const startIndex = (currentPageRef.current - 1) * DEFAULT_PAGE_SIZE;
  const endIndex = startIndex + DEFAULT_PAGE_SIZE;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredData.length / DEFAULT_PAGE_SIZE) || 1;

  const paginationInfo = {
    total_count: filteredData.length,
    total_pages: totalPages,
  };

  return (
    <PageRenderer
      data={filteredData}
      description="Track and analyze installed pipe footage across all jobs"
      emptyState={{
        title: "No footage records found",
        description:
          "There are no installed footage records available at this time.",
      }}
      error={
        error ? new Error(error.message || "Failed to load footage data") : null
      }
      isLoading={isLoading || false}
      loadingMessage="Loading footage data..."
      renderChildrenWhenEmpty={true}
      title="Installed Footage"
    >
      {() => (
        <PermissionCodeGate
          fallback={
            <AccessDeniedView message="You do not have permission to view Installed Footage. This page requires read access to Tiling Jobs." />
          }
          permissionCode={PermissionCode.JOBS_TILING_PAGE_READ}
        >
          <FootageBreadcrumbToolbar
            onOpenCharts={() => setSummaryChartsOpen(true)}
          />
          {summaryChartsOpen ? (
            <FootageChartsModal
              isOpen
              source={{ type: "summary", rows: filteredData }}
              onClose={() => setSummaryChartsOpen(false)}
            />
          ) : null}
          {selectedJob ? (
            <FootageChartsModal
              isOpen
              source={{ type: "job", job: selectedJob }}
              onClose={() => setSelectedJob(undefined)}
            />
          ) : null}
          {noteRow ? (
            <FootageNoteModal
              isOpen
              isSaving={isSavingNote}
              readOnly={!isAdmin}
              row={noteRow}
              onClose={() => setNoteRow(null)}
              onSave={handleSaveNote}
            />
          ) : null}
          <FootageTable
            crewOptions={crewFilterOptions}
            data={paginatedData}
            filters={filters}
            isAdmin={isAdmin}
            isLoading={isLoading}
            pagination={{
              currentPage: currentPageRef.current,
              isLoading: false,
              itemLabel: "footage records",
              pageSize: DEFAULT_PAGE_SIZE,
              totalCount: paginationInfo.total_count,
              totalPages: paginationInfo.total_pages,
              onPageChange: handlePageChange,
            }}
            search={{
              placeholder: "Search by job name…",
              value: searchQuery,
              onChange: setSearchQuery,
            }}
            sortRules={sortRules}
            onAddNote={setNoteRow}
            onDownloadExcel={handleGetExcelFile}
            onFiltersChange={setFilters}
            onSortRulesChange={handleSortRulesChange}
            onView={handleShowMore}
          />
        </PermissionCodeGate>
      )}
    </PageRenderer>
  );
}
