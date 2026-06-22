import { render, screen } from '@testing-library/react';
import React, { type ReactElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('recharts', async () => {
  const Actual = await vi.importActual<typeof import('recharts')>('recharts');

  const ResponsiveContainer = ({ children }: { children: ReactNode }) =>
    React.createElement('div', { style: { width: 400, height: 260 } }, children);

  return {
    ...Actual,
    ResponsiveContainer,
  };
});

import {
  ChartEmptyState,
  ChartLegend,
  FieldFlowBarChart,
  FieldFlowGroupedBarChart,
  FieldFlowRadialChart,
  FieldFlowTrendChart,
  getChartSeriesColor,
  hasChartValues,
  sumChartValues,
} from '../src/components/widgets/Charts';
import { ThemeModeEnum } from '../src/constants';
import { ThemeProvider } from '../src/theme';

function renderWithTheme(ui: ReactElement) {
  return render(
    <ThemeProvider defaultMode={ThemeModeEnum.LIGHT}>{ui}</ThemeProvider>
  );
}

describe('chart helpers', () => {
  it('detects when chart values exist', () => {
    expect(hasChartValues([{ jobs: 0 }, { jobs: 3 }], ['jobs'])).toBe(true);
    expect(hasChartValues([{ jobs: 0 }], ['jobs'])).toBe(false);
    expect(hasChartValues([], ['jobs'])).toBe(false);
  });

  it('sums radial values', () => {
    expect(sumChartValues([{ value: 2 }, { value: 3 }])).toBe(5);
  });

  it('returns series colors from CSS variables', () => {
    expect(getChartSeriesColor(0)).toContain('chart-series');
  });
});

describe('ChartEmptyState', () => {
  it('renders empty messaging', () => {
    renderWithTheme(
      <ChartEmptyState title="No data" description="Try again later." />
    );
    expect(screen.getByRole('status')).toHaveTextContent('No data');
    expect(screen.getByText('Try again later.')).toBeInTheDocument();
  });

  it('uses explicit height for the plot area', () => {
    renderWithTheme(<ChartEmptyState height={180} title="No data" />);
    expect(screen.getByRole('status')).toHaveStyle({ height: '180px' });
  });
});

describe('ChartLegend', () => {
  it('renders legend items with values', () => {
    renderWithTheme(
      <ChartLegend
        items={[
          { id: 'a', label: 'Active', color: '#000', value: 12 },
          { id: 'b', label: 'Pending', color: '#111', value: 4 },
        ]}
        showValues
      />
    );
    expect(screen.getByRole('list', { name: 'Chart legend' })).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});

describe('FieldFlowBarChart', () => {
  it('shows empty state when data has no values', () => {
    renderWithTheme(
      <FieldFlowBarChart data={[{ name: 'A', count: 0 }]} xKey="name" yKey="count" />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders chart region when data is present', () => {
    renderWithTheme(
      <FieldFlowBarChart
        data={[{ name: 'A', count: 5 }]}
        xKey="name"
        yKey="count"
        showLegend={false}
      />
    );
    expect(screen.getByRole('img', { name: 'Bar chart' })).toBeInTheDocument();
  });
});

describe('FieldFlowGroupedBarChart', () => {
  it('shows empty state when all series are zero', () => {
    renderWithTheme(
      <FieldFlowGroupedBarChart
        data={[{ type: 'Repair', Active: 0, Completed: 0 }]}
        xKey="type"
      />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders grouped bar chart when data is present', () => {
    renderWithTheme(
      <FieldFlowGroupedBarChart
        data={[
          { type: 'Repair', Active: 2, Completed: 1 },
          { type: 'Tile', Active: 4, Completed: 0 },
        ]}
        xKey="type"
        showLegend={false}
      />
    );
    expect(
      screen.getByRole('img', { name: 'Grouped bar chart' })
    ).toBeInTheDocument();
  });
});

describe('FieldFlowTrendChart', () => {
  it('renders trend chart for series data', () => {
    renderWithTheme(
      <FieldFlowTrendChart
        data={[
          { month: 'Jan', jobs: 1 },
          { month: 'Feb', jobs: 4 },
        ]}
        xKey="month"
        series={[{ key: 'jobs', label: 'Jobs' }]}
        showLegend={false}
      />
    );
    expect(screen.getByRole('img', { name: 'Trend chart' })).toBeInTheDocument();
  });
});

describe('FieldFlowRadialChart', () => {
  it('shows empty state when total is zero', () => {
    renderWithTheme(
      <FieldFlowRadialChart
        data={[{ id: 'a', label: 'Active', value: 0 }]}
        showLegend={false}
      />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders radial chart when values exist', () => {
    renderWithTheme(
      <FieldFlowRadialChart
        data={[
          { id: 'a', label: 'Active', value: 10 },
          { id: 'b', label: 'Done', value: 5 },
        ]}
        showLegend={false}
      />
    );
    expect(screen.getByRole('img', { name: 'Radial chart' })).toBeInTheDocument();
  });
});
