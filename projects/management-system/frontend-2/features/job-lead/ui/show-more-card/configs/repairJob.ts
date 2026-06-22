import { JobType } from "@/constants";
import { ProductionTracking } from "@/features/jobs/ui/production-tracking";

import { createJobConfig } from "../factories/configFactories";
import { ShowMoreCardConfig, toShowMoreCardTabComponent } from "../types";

export const REPAIR_JOB_CONFIG: ShowMoreCardConfig = createJobConfig(
  JobType.REPAIR,
  {
    tabs: ["Job Details", "Production Tracking", "Files"],

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
    },
  }
);
