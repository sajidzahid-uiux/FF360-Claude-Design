export function hasLegendData(legend: Record<string, number>): boolean {
  return Object.values(legend).some((value) => value > 0);
}

export function hasBarCountData(rows: Array<{ Count: number }>): boolean {
  return rows.some((row) => row.Count > 0);
}
