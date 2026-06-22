import { JobType } from "@/constants";
import RepairLeadScheduling from "@/features/leads/ui/lead-detail/RepairLeadScheduling";

import { createLeadConfig } from "../factories/configFactories";
import { ShowMoreCardConfig, toShowMoreCardTabComponent } from "../types";

export const REPAIR_LEAD_CONFIG: ShowMoreCardConfig = createLeadConfig(
  JobType.REPAIR,
  {
    tabs: ["Lead Details", "Scheduling", "Files"],

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

    components: {
      financialTab: toShowMoreCardTabComponent(RepairLeadScheduling),
    },
  }
);
