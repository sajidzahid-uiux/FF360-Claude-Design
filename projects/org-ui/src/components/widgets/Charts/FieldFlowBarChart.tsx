import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

export interface FieldFlowBarChartDatum {
  [key: string]: string | number;
}

export interface FieldFlowBarChartProps {
  data: FieldFlowBarChartDatum[];
  xKey: string;
  yKey: string;
  height?: number;
  className?: string;
  barRadius?: number;
  colors?: string[];
  showLegend?: boolean;
  legendScrollable?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
}

export function FieldFlowBarChart({
  data,
  xKey,
  yKey,
  height = 260,
  className,
  barRadius = 6,
  colors,
  showLegend = true,
  legendScrollable = false,
  emptyTitle,
  emptyDescription,
  valueFormatter = (value) => value.toLocaleString(),
  labelFormatter = (label) => label,
}: FieldFlowBarChartProps) {
  const isEmpty = !hasChartValues(data, [yKey]);

  const resolvedColors = useMemo(
    () => data.map((_, index) => colors?.[index] ?? getChartSeriesColor(index)),
    [colors, data]
  );

  const legendItems = useMemo((): ChartLegendItem[] => {
    return data.map((row, index) => ({
      id: `${String(row[xKey])}-${index}`,
      label: String(row[xKey]),
      color: resolvedColors[index],
      value: typeof row[yKey] === 'number' ? valueFormatter(row[yKey]) : row[yKey],
    }));
  }, [data, resolvedColors, valueFormatter, xKey, yKey]);

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
      <ChartContainer height={height} ariaLabel="Bar chart">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={chartAxisTick}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
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
            formatter={(value: number) => [valueFormatter(value), yKey]}
            labelFormatter={labelFormatter}
          />
          <Bar dataKey={yKey} radius={[barRadius, barRadius, 0, 0]} maxBarSize={48}>
            {data.map((entry, index) => (
              <Cell key={`${entry[xKey]}-${index}`} fill={resolvedColors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      {showLegend ? (
        <ChartLegend
          items={legendItems}
          showValues
          scrollable={legendScrollable || legendItems.length > 4}
        />
      ) : null}
    </div>
  );
}
