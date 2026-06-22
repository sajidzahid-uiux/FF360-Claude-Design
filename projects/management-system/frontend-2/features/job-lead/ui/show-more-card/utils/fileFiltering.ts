import { FileType, FileTypeConfig, JobFileItem } from "../types";

/**
 * Filter files by type based on configuration
 */
export function filterFilesByType(
  files: JobFileItem[],
  fileTypeConfig: FileTypeConfig
): Record<string, JobFileItem[]> {
  const result: Record<string, JobFileItem[]> = {
    contractor: [],
    one_call: [],
    farmer: [],
    designer: [],
    special: [],
  };

  if (!files || !Array.isArray(files)) {
    return result;
  }

  // Always filter contractor files as default (catch-all for regular files).
  // Files prefixed with "other_file_" (web & mobile Quick Actions) always belong here
  // regardless of any keywords in the rest of the filename.
  // "_contractor_qa_" is kept as a legacy guard for files already in the database.
  result.contractor = files.filter((f) => {
    const title = f.title?.toLowerCase() || "";
    if (
      title.startsWith("other_file_") ||
      title.startsWith("_contractor_qa_")
    ) {
      return true;
    }
    return (
      f.diggs_file === false &&
      f.designer_file !== true &&
      !title.includes("one_call_file") &&
      !title.includes("design_file") &&
      !title.includes("delivered") &&
      !title.includes("shape") &&
      !title.includes("xml") &&
      !title.includes("pro_map") &&
      !title.includes("farm_parameter") &&
      !title.includes("farm_visualization")
    );
  });

  // Filter regular file types
  if (fileTypeConfig.regular) {
    fileTypeConfig.regular.forEach((type) => {
      if (type === "one_call") {
        result.one_call = files.filter((f) =>
          f.title.toLowerCase().includes("one_call_file")
        );
      } else if (type === "farmer") {
        result.farmer = files.filter((f) => {
          const title = f.title?.toLowerCase() || "";
          return (
            f.farmer_file === true &&
            !title.startsWith("other_file_") &&
            !title.startsWith("_contractor_qa_")
          );
        });
      } else if (type === "designer") {
        result.designer = files.filter((f) => f.designer_file === true);
      }
    });
  }

  // Filter special file types (for tiling).
  // Files prefixed with "other_file_" (web & mobile Quick Actions) or legacy
  // "_contractor_qa_" are always treated as contractor files — never special.
  if (fileTypeConfig.special && fileTypeConfig.special.length > 0) {
    const specialFiles = files.filter((f) => {
      const title = f.title?.toLowerCase() || "";
      if (
        title.startsWith("other_file_") ||
        title.startsWith("_contractor_qa_")
      )
        return false;
      return (
        title.includes("pro_map") ||
        title.includes("design_file") ||
        title.includes("delivered") ||
        title.includes("shape") ||
        title.includes("xml") ||
        title.includes("farm_parameter") ||
        title.includes("farm_visualization")
      );
    });
    result.special = specialFiles;
  }

  return result;
}

/**
 * Get all file types that should be displayed
 */
export function getFileTypesToDisplay(
  fileTypeConfig: FileTypeConfig
): FileType[] {
  const types: FileType[] = [];

  if (fileTypeConfig.regular) {
    types.push(...fileTypeConfig.regular);
  }

  if (fileTypeConfig.special && fileTypeConfig.special.length > 0) {
    types.push("special");
  }

  return types;
}
