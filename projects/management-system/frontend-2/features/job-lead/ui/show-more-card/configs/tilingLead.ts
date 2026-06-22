import { JobType } from "@/constants";
import EstimateLeads from "@/features/leads/ui/lead-detail/EstimateLeads";
import FinancialAndScheduling from "@/features/leads/ui/lead-detail/FinancialAndScheduling";
import UploadFileTiling from "@/shared/ui/common/UploadFile";

import { createLeadConfig } from "../factories/configFactories";
import { ShowMoreCardConfig, toShowMoreCardTabComponent } from "../types";

export const TILING_LEAD_CONFIG: ShowMoreCardConfig = createLeadConfig(
  JobType.TILING,
  {
    tabs: ["Lead Details", "Financial & Scheduling", "Estimate", "Files"],

    fileTypes: {
      special: [
        {
          value: "design",
          label: "Design File",
          prefix: "design_file",
          uploadType: "regular",
        },
        {
          value: "delivered",
          label: "Delivered File",
          prefix: "delivered_file",
          uploadType: "regular",
        },
        {
          value: "shape",
          label: "Shape File",
          prefix: "shape_file",
          uploadType: "map",
          mapField: "shpmap",
        },
        {
          value: "xml",
          label: "XML File",
          prefix: "xml_file",
          uploadType: "map",
          mapField: "xmlmap",
        },
        {
          value: "kml",
          label: "KML File",
          prefix: "kml_file",
          uploadType: "map",
          mapField: "kmlmap",
        },
      ],
      regular: ["contractor", "one_call"],
    },

    features: {
      corePoints: true,
      designerAssignment: true,
      acreage: true,
    },

    components: {
      uploadFile: toShowMoreCardTabComponent(UploadFileTiling),
      financialTab: toShowMoreCardTabComponent(FinancialAndScheduling),
      estimateTab: toShowMoreCardTabComponent(EstimateLeads),
    },
  }
);
