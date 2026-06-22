import { JobType, ResourceType } from "@/constants";
import type { SpecialFileType } from "@/features/job-lead/ui/show-more-card/exports";

export interface UploadFileDropdownProps {
  entityType: ResourceType;
  jobType: JobType;
  fileTypesConfig: {
    special?: SpecialFileType[];
    regular?: string[];
  };
  uploading: boolean;
  disabled: boolean;
  onFileTypeSelect: (params: {
    fileType: "farmer" | "contractor" | "one_call" | "designer";
    fileName: string;
    isFixedTitle: boolean;
  }) => void;
}

export type FileTypePayload = {
  fileType: "farmer" | "contractor" | "one_call" | "designer";
  fileName: string;
  isFixedTitle: boolean;
};
