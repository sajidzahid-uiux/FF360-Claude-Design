import { useMemo } from 'react';
import { Cell, Label, Pie, PieChart, Tooltip } from 'recharts';
import { cn } from '../../../utils/cn';
import { ChartContainer } from './ChartContainer';
import { ChartEmptyState } from './ChartEmptyState';
import { ChartLegend, type ChartLegendItem } from './ChartLegend';
import {
  chartTooltipContentStyle,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  getChartSeriesColor,
  sumChartValues,
} from './chartTheme';

export interface FieldFlowRadialChartDatum {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface FieldFlowRadialChartCenterLabel {
  value: string | number;
  subtitle?: string;
}

export interface FieldFlowRadialChartProps {
  data: FieldFlowRadialChartDatum[];
  height?: number;
  className?: string;
  innerRadius?: number | string;
  outerRadius?: number | string;
  strokeWidth?: number;
  showLegend?: boolean;
  legendScrollable?: boolean;
  centerLabel?: FieldFlowRadialChartCenterLabel;
  emptyTitle?: string;
  emptyDescription?: string;
  valueFormatter?: (value: number) => string;
}

export function FieldFlowRadialChart({
  data,
  height = 280,
  className,
  innerRadius = '58%',
  outerRadius = '82%',
  strokeWidth = 4,
  showLegend = true,
  legendScrollable = false,
  centerLabel,
  emptyTitle,
  emptyDescription,
  valueFormatter = (value) => value.toLocaleString(),
}: FieldFlowRadialChartProps) {
  const normalized = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        color: item.color ?? getChartSeriesColor(index),
      })),
    [data]
  );

  const total = sumChartValues(normalized);
  const isEmpty = normalized.length === 0 || total === 0;

  const legendItems = useMemo((): ChartLegendItem[] => {
    return normalized.map((item) => ({
      id: item.id,
      label: item.label,
      color: item.color,
      value: valueFormatter(item.value),
    }));
  }, [normalized, valueFormatter]);

  const resolvedCenterLabel = useMemo(() => {
    if (centerLabel) return centerLabel;
    return { value: valueFormatter(total), subtitle: 'Total' };
  }, [centerLabel, total, valueFormatter]);

  if (isEmpty) {
    return (
      <div className={cn('flex w-full min-w-0 flex-col', className)}>
        <ChartEmptyState
          height={height}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex w-full min-w-0 flex-col gap-4', className)}>
      <ChartContainer height={height} ariaLabel="Radial chart">
        <PieChart>
          <Tooltip
            contentStyle={chartTooltipContentStyle}
            labelStyle={chartTooltipLabelStyle}
            itemStyle={chartTooltipItemStyle}
            formatter={(value: number, _name, item) => {
              const payload = item?.payload as FieldFlowRadialChartDatum | undefined;
              return [valueFormatter(value), payload?.label ?? ''];
            }}
          />
          <Pie
            data={normalized}
            dataKey="value"
            nameKey="label"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            stroke="var(--color-bg-surface-elevated)"
            strokeWidth={strokeWidth}
            paddingAngle={2}
          >
            {normalized.map((entry) => (
              <Cell key={entry.id} fill={entry.color} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) {
                  return null;
                }
                const cx = viewBox.cx as number;
                const cy = viewBox.cy as number;
                return (
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan
                      x={cx}
                      y={cy}
                      className="fill-[var(--color-text-primary)] text-2xl font-bold sm:text-3xl"
                    >
                      {resolvedCenterLabel.value}
                    </tspan>
                    {resolvedCenterLabel.subtitle ? (
                      <tspan
                        x={cx}
                        dy={22}
                        className="fill-[var(--color-text-muted)] text-xs font-medium"
                      >
                        {resolvedCenterLabel.subtitle}
                      </tspan>
                    ) : null}
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      {showLegend ? (
        <ChartLegend
          items={legendItems}
          showValues
          scrollable={legendScrollable || legendItems.length > 5}
        />
      ) : null}
    </div>
  );
}
