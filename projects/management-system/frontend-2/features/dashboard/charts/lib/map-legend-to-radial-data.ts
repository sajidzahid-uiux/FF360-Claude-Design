import {
  type FieldFlowRadialChartDatum,
  getChartSeriesColor,
} from "@fieldflow360/org-ui";

export function mapLegendToRadialData(
  legend: Record<string, number>
): FieldFlowRadialChartDatum[] {
  return Object.entries(legend).map(([label, value], index) => ({
    id: label.toLowerCase().replace(/\s+/g, "-"),
    label,
    value,
    color: getChartSeriesColor(index),
  }));
}
