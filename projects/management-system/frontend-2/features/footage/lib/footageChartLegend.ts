import type { FootageJobData, FormattedFootageData } from "@/api/types";

export type FootageChartTab = "all" | "single_wall" | "dual_wall";

export function getFootageJobTitle(job: FootageJobData): string {
  return (
    job.contact_info?.full_name || job["Customer Name"] || "Footage details"
  );
}

export function getFootageMainChartTitle(tab: FootageChartTab): string {
  if (tab === "single_wall") return "Total Single Wall by Pipe Size";
  if (tab === "dual_wall") return "Total Dual Wall by Pipe Size";
  return "Total Main Footage by Pipe Size";
}

export function buildFootageMainChartLegend(
  job: FootageJobData,
  tab: FootageChartTab
): Record<string, number> {
  const singleWall = job.single_wall ?? {};
  const dualWall = job.dual_wall ?? {};

  return [...new Set([...Object.keys(singleWall), ...Object.keys(dualWall)])]
    .map((size) => {
      const val =
        tab === "single_wall"
          ? (singleWall[size] ?? 0)
          : tab === "dual_wall"
            ? (dualWall[size] ?? 0)
            : (singleWall[size] ?? 0) + (dualWall[size] ?? 0);
      return [size, val] as const;
    })
    .filter(([, value]) => value > 0)
    .sort(([a], [b]) => Number(a) - Number(b))
    .reduce<Record<string, number>>((acc, [size, value]) => {
      acc[`${size}"`] = value;
      return acc;
    }, {});
}

export function buildFootageLateralChartLegend(
  job: FootageJobData
): Record<string, number> {
  return { Total: job["Total Installed Lateral Footage"] };
}

export function buildSummaryLateralChartLegend(
  rows: FormattedFootageData[]
): Record<string, number> {
  const total = rows.reduce(
    (sum, row) =>
      sum + (Number(row.total_lateral_footage.replace(/[^\d.]/g, "")) || 0),
    0
  );
  return { Total: total };
}

export function buildSummaryMainChartLegend(
  rows: FormattedFootageData[],
  tab: FootageChartTab
): Record<string, number> {
  const mainPipeTotals: Record<string, number> = {};

  for (const row of rows) {
    for (const size of Object.keys(row.single_wall)) {
      const val =
        tab === "single_wall"
          ? (row.single_wall[size] ?? 0)
          : tab === "dual_wall"
            ? (row.dual_wall[size] ?? 0)
            : (row.single_wall[size] ?? 0) + (row.dual_wall[size] ?? 0);
      mainPipeTotals[size] = (mainPipeTotals[size] ?? 0) + val;
    }
  }

  return Object.entries(mainPipeTotals)
    .filter(([, value]) => value > 0)
    .sort(([a], [b]) => Number(a) - Number(b))
    .reduce<Record<string, number>>((acc, [size, value]) => {
      acc[`${size}"`] = value;
      return acc;
    }, {});
}
