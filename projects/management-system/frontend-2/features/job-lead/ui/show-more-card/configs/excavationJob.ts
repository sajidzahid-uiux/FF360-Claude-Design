import { JobType } from "@/constants";
import FinancialTab from "@/features/jobs/ui/excavation/FinancialTab";
import { ProductionTracking } from "@/features/jobs/ui/production-tracking";
import EstimateJobs from "@/features/jobs/ui/production-tracking/EstimateJobs";

import { createJobConfig } from "../factories/configFactories";
import { ShowMoreCardConfig, toShowMoreCardTabComponent } from "../types";

export const EXCAVATION_JOB_CONFIG: ShowMoreCardConfig = createJobConfig(
  JobType.EXCAVATION,
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
      regular: ["one_call"],
    },

    components: {
      productionTracking: toShowMoreCardTabComponent(ProductionTracking),
      financialTab: toShowMoreCardTabComponent(FinancialTab),
      estimateTab: toShowMoreCardTabComponent(EstimateJobs),
    },
  }
);
