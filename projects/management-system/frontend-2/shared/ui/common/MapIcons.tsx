import {
  JobLeadTypeSegment,
  JobType,
  apiJobTypeToJobLeadTypeSegment,
} from "@/constants";

import {
  Excavator2SVG,
  Excavator3SVG,
  ExcavatorSVG,
  HandWrenchSVG,
  TilingIcon1SVG,
  TilingIcon2SVG,
  TilingIcon3SVG,
  ToolboxSVG,
  WrenchSVG,
} from "./MapIconComponents";

// Icon mapping system - maps icon numbers to actual icons
export const ICON_MAP = {
  repair: {
    1: { label: "Repair Icon 1", icon: <WrenchSVG size={20} /> },
    2: { label: "Repair Icon 2", icon: <ToolboxSVG size={20} /> },
    3: { label: "Repair Icon 3", icon: <HandWrenchSVG size={20} /> },
  },
  excavation: {
    1: { label: "Excavator Icon 1", icon: <ExcavatorSVG size={20} /> },
    2: { label: "Excavator Icon 2", icon: <Excavator2SVG size={20} /> },
    3: { label: "Excavator Icon 3", icon: <Excavator3SVG size={20} /> },
  },
  tiling: {
    1: { label: "Tiling Icon 1", icon: <TilingIcon1SVG size={20} /> },
    2: { label: "Tiling Icon 2", icon: <TilingIcon2SVG size={20} /> },
    3: { label: "Tiling Icon 3", icon: <TilingIcon3SVG size={20} /> },
  },
};

// Map icon mapping for actual map display
export const MAP_ICON_MAP = {
  [JobType.REPAIR]: {
    1: <WrenchSVG color="#fff" size={18} />,
    2: <ToolboxSVG color="#fff" size={18} />,
    3: <HandWrenchSVG color="#fff" size={18} />,
  },
  [JobType.EXCAVATION]: {
    1: <ExcavatorSVG color="#fff" size={18} />,
    2: <Excavator2SVG color="#fff" size={18} />,
    3: <Excavator3SVG color="#fff" size={18} />,
  },
  [JobType.TILING]: {
    1: <TilingIcon1SVG color="#fff" size={18} />,
    2: <TilingIcon2SVG color="#fff" size={18} />,
    3: <TilingIcon3SVG color="#fff" size={18} />,
  },
};

export const getIconByNumber = (type: string, iconNumber: string) => {
  const typeMap = MAP_ICON_MAP[type as keyof typeof MAP_ICON_MAP];
  if (typeMap && iconNumber) {
    const num = parseInt(iconNumber);
    return typeMap[num as keyof typeof typeMap] || typeMap[1];
  }
  return typeMap?.[1] || <WrenchSVG color="#fff" size={18} />;
};

export const getIconOptions = (type: string) => {
  const normalizedType =
    apiJobTypeToJobLeadTypeSegment(type) ?? JobLeadTypeSegment.REPAIR;
  return Object.entries(
    ICON_MAP[normalizedType as keyof typeof ICON_MAP] || ICON_MAP.repair
  ).map(([number, config]) => ({
    value: number,
    label: config.label,
    icon: config.icon,
  }));
};
