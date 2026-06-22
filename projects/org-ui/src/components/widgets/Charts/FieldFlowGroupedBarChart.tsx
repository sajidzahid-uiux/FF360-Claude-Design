import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '../../../utils/cn';
import { ChartContainer } from './ChartContainer';
import { ChartEmptyState } from './ChartEmptyState';
import { ChartLegend, type ChartLegendItem } from './ChartLegend';
import {
  chartAxisTick,
  chartTooltipContentStyle,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  getChartSeriesColor,
  hasChartValues,
} from './chartTheme';

export interface FieldFlowGroupedBarSeries {
  key: string;
  label: string;
  color?: string;
}

export interface FieldFlowGroupedBarChartDatum {
  [key: string]: string | number;
}

export interface FieldFlowGroupedBarChartProps {
  data: FieldFlowGroupedBarChartDatum[];
  xKey: string;
  series?: FieldFlowGroupedBarSeries[];
  height?: number;
  className?: string;
  barSize?: number;
  barRadius?: number;
  showLegend?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
  ariaLabel?: string;
}

function deriveSeriesKeys(
  data: FieldFlowGroupedBarChartDatum[],
  xKey: string
): string[] {
  if (data.length === 0) {
    return [];
  }
  return Object.keys(data[0]).filter((key) => key !== xKey);
}

export function FieldFlowGroupedBarChart({
  data,
  xKey,
  series: seriesProp,
  height = 260,
  className,
  barSize = 20,
  barRadius = 4,
  showLegend = true,
  emptyTitle,
  emptyDescription,
  valueFormatter = (value) => value.toLocaleString(),
  labelFormatter = (label) => label,
  ariaLabel = 'Grouped bar chart',
}: FieldFlowGroupedBarChartProps) {
  const resolvedSeries = useMemo((): FieldFlowGroupedBarSeries[] => {
    const keys =
      seriesProp?.map((item) => item.key) ?? deriveSeriesKeys(data, xKey);
    return keys.map((key, index) => {
      const fromProp = seriesProp?.find((item) => item.key === key);
      return {
        key,
        label: fromProp?.label ?? key,
        color: fromProp?.color ?? getChartSeriesColor(index),
      };
    });
  }, [data, seriesProp, xKey]);

  const valueKeys = useMemo(
    () => resolvedSeries.map((item) => item.key),
    [resolvedSeries]
  );

  const isEmpty = !hasChartValues(data, valueKeys);

  const legendItems = useMemo((): ChartLegendItem[] => {
    return resolvedSeries.map((item, index) => ({
      id: item.key,
      label: item.label,
      color: item.color ?? getChartSeriesColor(index),
    }));
  }, [resolvedSeries]);

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
      <ChartContainer height={height} ariaLabel={ariaLabel}>
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={chartAxisTick}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickFormatter={labelFormatter}
          />
          <YAxis
            allowDecimals={false}
            tick={chartAxisTick}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-bg-hover)', opacity: 0.35 }}
            contentStyle={chartTooltipContentStyle}
            labelStyle={chartTooltipLabelStyle}
            itemStyle={chartTooltipItemStyle}
            formatter={(value: number, name: string) => {
              const match = resolvedSeries.find((item) => item.key === name);
              return [valueFormatter(value), match?.label ?? name];
            }}
            labelFormatter={labelFormatter}
          />
          {resolvedSeries.map((item) => (
            <Bar
              key={item.key}
              barSize={barSize}
              dataKey={item.key}
              fill={item.color}
              radius={[barRadius, barRadius, 0, 0]}
            />
          ))}
        </BarChart>
      </ChartContainer>
      {showLegend ? (
        <ChartLegend
          items={legendItems}
          scrollable={legendItems.length > 3}
        />
      ) : null}
    </div>
  );
}
