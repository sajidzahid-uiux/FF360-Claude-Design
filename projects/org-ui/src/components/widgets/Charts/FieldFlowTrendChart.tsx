import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
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

export interface FieldFlowTrendSeries {
  key: string;
  label: string;
  color?: string;
}

export interface FieldFlowTrendChartDatum {
  [key: string]: string | number;
}

export interface FieldFlowTrendChartProps {
  data: FieldFlowTrendChartDatum[];
  xKey: string;
  series: FieldFlowTrendSeries[];
  height?: number;
  className?: string;
  showLegend?: boolean;
  showDots?: boolean;
  curveType?: 'monotone' | 'linear';
  emptyTitle?: string;
  emptyDescription?: string;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
}

export function FieldFlowTrendChart({
  data,
  xKey,
  series,
  height = 260,
  className,
  showLegend = true,
  showDots = true,
  curveType = 'monotone',
  emptyTitle,
  emptyDescription,
  valueFormatter = (value) => value.toLocaleString(),
  labelFormatter = (label) => label,
}: FieldFlowTrendChartProps) {
  const isEmpty = !hasChartValues(
    data,
    series.map((item) => item.key)
  );

  const resolvedSeries = useMemo(
    () =>
      series.map((item, index) => ({
        ...item,
        color: item.color ?? getChartSeriesColor(index),
      })),
    [series]
  );

  const legendItems = useMemo((): ChartLegendItem[] => {
    return resolvedSeries.map((item) => ({
      id: item.key,
      label: item.label,
      color: item.color,
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
      <ChartContainer height={height} ariaLabel="Trend chart">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xKey}
            tick={chartAxisTick}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickFormatter={labelFormatter}
          />
          <YAxis allowDecimals={false} tick={chartAxisTick} tickLine={false} axisLine={false} width={40} />
          <Tooltip
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
            <Line
              key={item.key}
              type={curveType}
              dataKey={item.key}
              name={item.key}
              stroke={item.color}
              strokeWidth={2}
              dot={
                showDots
                  ? { r: 3, fill: item.color, strokeWidth: 0 }
                  : false
              }
              activeDot={{ r: 5, fill: item.color, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ChartContainer>
      {showLegend ? <ChartLegend items={legendItems} scrollable={legendItems.length > 3} /> : null}
    </div>
  );
}
