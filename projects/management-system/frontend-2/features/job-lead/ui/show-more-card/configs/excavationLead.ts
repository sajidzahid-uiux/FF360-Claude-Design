import { JobType } from "@/constants";
import EstimateLeads from "@/features/leads/ui/lead-detail/EstimateLeads";
import FinancialAndScheduling from "@/features/leads/ui/lead-detail/FinancialAndScheduling";

import { createLeadConfig } from "../factories/configFactories";
import { ShowMoreCardConfig, toShowMoreCardTabComponent } from "../types";

export const EXCAVATION_LEAD_CONFIG: ShowMoreCardConfig = createLeadConfig(
  JobType.EXCAVATION,
  {
    tabs: ["Lead Details", "Financial & Scheduling", "Estimate", "Files"],

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
      regular: ["contractor", "one_call"],
    },

    features: {
      equipmentSelection: true, // For convert to job
    },

    components: {
      financialTab: toShowMoreCardTabComponent(FinancialAndScheduling),
      estimateTab: toShowMoreCardTabComponent(EstimateLeads),
    },
  }
);
