import { JobType } from "@/constants";
import { ProductionTracking } from "@/features/jobs/ui/production-tracking";
import EstimateJobs from "@/features/jobs/ui/production-tracking/EstimateJobs";
import DailyProgressPopUp from "@/features/jobs/ui/tiling/DailyProgressPopUp";
import FinancialTab from "@/features/jobs/ui/tiling/FinancialTab";
import { UploadDelievered } from "@/features/jobs/ui/tiling/UploadDelievered";
import UploadFileTiling from "@/shared/ui/common/UploadFile";

import { createJobConfig } from "../factories/configFactories";
import { ShowMoreCardConfig, toShowMoreCardTabComponent } from "../types";

export const TILING_JOB_CONFIG: ShowMoreCardConfig = createJobConfig(
  JobType.TILING,
  {
    tabs: [
      "Job Details",
      "Production Tracking",
      "Financial",
      "Estimate",
      "Files",
    ],

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
      regular: ["contractor", "one_call", "farmer", "designer"],
    },

    features: {
      corePoints: true,
      pipeOrdering: true,
      dailyProgress: true,
      machineTab: true,
      designerAssignment: true,
      acreage: true,
    },

    components: {
      uploadFile: toShowMoreCardTabComponent(UploadFileTiling),
      uploadDelivered: toShowMoreCardTabComponent(UploadDelievered),
      dailyProgress: toShowMoreCardTabComponent(DailyProgressPopUp),
      productionTracking: toShowMoreCardTabComponent(ProductionTracking),
      financialTab: toShowMoreCardTabComponent(FinancialTab),
      estimateTab: toShowMoreCardTabComponent(EstimateJobs),
    },
  }
);
