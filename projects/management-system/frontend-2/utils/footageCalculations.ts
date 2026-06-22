import type { FootageJobData } from "@/api/types";
import { WallType } from "@/constants";

export interface MainFootageTotals {
  singleWallTotal: number;
  dualWallTotal: number;
  total: number;
}

export function calculateMainFootageTotals(
  mainProgressData?: unknown[][]
): MainFootageTotals {
  if (!mainProgressData || mainProgressData.length <= 1) {
    return {
      singleWallTotal: 0,
      dualWallTotal: 0,
      total: 0,
    };
  }

  let singleWallTotal = 0;
  let dualWallTotal = 0;

  for (let i = 1; i < mainProgressData.length; i++) {
    const row = mainProgressData[i];
    const footage = Number(row[3]) || 0;
    const wallType = row[6];

    if (wallType === WallType.SINGLE_WALL || wallType === "single_wall") {
      singleWallTotal += footage;
    } else if (wallType === WallType.DUAL_WALL || wallType === "dual_wall") {
      dualWallTotal += footage;
    } else {
      singleWallTotal += footage;
    }
  }

  return {
    singleWallTotal,
    dualWallTotal,
    total: singleWallTotal + dualWallTotal,
  };
}

export function calculateMainFootageTotal(
  data: FootageJobData | number | null | undefined
): number {
  if (data == null) return 0;
  if (typeof data === "number") return data;

  const sumValues = (obj?: Record<string, number>) =>
    Object.values(obj ?? {}).reduce((sum, v) => sum + (v ?? 0), 0);

  return sumValues(data.single_wall) + sumValues(data.dual_wall);
}
