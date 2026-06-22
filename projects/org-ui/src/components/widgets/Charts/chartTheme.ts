import type { CSSProperties } from 'react';

export const CHART_SERIES_COLORS = [
  'var(--color-chart-series-1)',
  'var(--color-chart-series-2)',
  'var(--color-chart-series-3)',
  'var(--color-chart-series-4)',
] as const;

export const CHART_GRID_STROKE = 'var(--color-chart-grid)';
export const CHART_AXIS_TICK_FILL = 'var(--color-chart-axis)';

export const chartTooltipContentStyle: CSSProperties = {
  backgroundColor: 'var(--color-chart-tooltip-bg)',
  borderColor: 'var(--color-chart-tooltip-border)',
  borderRadius: '0.75rem',
  borderWidth: 1,
  borderStyle: 'solid',
  color: 'var(--color-text-primary)',
  boxShadow: '0 10px 30px -12px rgb(0 0 0 / 0.35)',
  padding: '0.5rem 0.75rem',
};

export const chartTooltipLabelStyle: CSSProperties = {
  color: 'var(--color-text-primary)',
  fontWeight: 600,
  marginBottom: 4,
};

export const chartTooltipItemStyle: CSSProperties = {
  color: 'var(--color-text-secondary)',
};

export const chartAxisTick = {
  fontSize: 12,
  fill: CHART_AXIS_TICK_FILL,
} as const;

export const chartContainerClassName =
  '[&_.recharts-cartesian-grid_line]:stroke-[var(--color-chart-grid)] [&_.recharts-cartesian-axis-tick_text]:fill-[var(--color-chart-axis)] [&_.recharts-cartesian-axis_line]:stroke-[var(--color-chart-grid)] [&_.recharts-layer]:outline-none [&_.recharts-surface]:outline-none';

export function getChartSeriesColor(index: number, palette = CHART_SERIES_COLORS): string {
  return palette[index % palette.length] ?? palette[0];
}

export function hasChartValues(
  data: Array<Record<string, string | number | null | undefined>>,
  valueKeys: string[]
): boolean {
  if (data.length === 0) return false;
  return data.some((row) =>
    valueKeys.some((key) => {
      const value = row[key];
      return typeof value === 'number' && value > 0;
    })
  );
}

export function sumChartValues(
  data: Array<{ value: number }>
): number {
  return data.reduce((total, item) => total + Math.max(0, item.value), 0);
}
